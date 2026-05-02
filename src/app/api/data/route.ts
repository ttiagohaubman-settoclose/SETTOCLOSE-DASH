import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientById, getClients } from "@/lib/clients";
import { getMetaMetrics } from "@/lib/meta";
import { getGHLMetrics, getAllContacts } from "@/lib/ghl";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import type { ClientData, AgencyData, DateRange } from "@/types";

function cacheKey(clientId: string, dateRange: DateRange) {
  return `cache:data:${clientId}:${dateRange.startDate}:${dateRange.endDate}`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const refresh = searchParams.get("refresh") === "true";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  if (session.user.role === "client" && clientId !== session.user.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dateRange: DateRange = { startDate, endDate };

  try {
    // ── Agency view ──────────────────────────────────────────────
    if (!clientId || clientId === "agency") {
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const key = cacheKey("agency", dateRange);
      if (!refresh) {
        const cached = await cacheGet<AgencyData>(key);
        if (cached) return NextResponse.json(cached);
      } else {
        await cacheDel(key);
      }

      const clients = await getClients();

      // Fetch GHL contacts ONCE for all clients, Meta in parallel per account
      const [allContacts, ...metaResults] = await Promise.all([
        getAllContacts(dateRange),
        ...clients.map((c) => getMetaMetrics(c.adAccountId, dateRange)),
      ]);

      // Build each client's data reusing the already-fetched contacts
      const clientDataArr: ClientData[] = await Promise.all(
        clients.map(async (c, i) => {
          const meta = metaResults[i];
          const ghl = await getGHLMetrics(c.ghlTag, c.payout, dateRange, allContacts as never);
          const roas = meta.spend > 0 ? ghl.cashCollected / meta.spend : 0;
          return { clientId: c.id, meta, ghl, roas, lastUpdated: new Date().toISOString() };
        })
      );

      const totals = clientDataArr.reduce(
        (acc, d) => ({
          spend: acc.spend + d.meta.spend,
          leads: acc.leads + d.meta.leads,
          scheduled: acc.scheduled + d.ghl.scheduled,
          closed: acc.closed + d.ghl.closed,
          revenue: acc.revenue + d.ghl.revenue,
          cashCollected: acc.cashCollected + d.ghl.cashCollected,
          roas: 0,
        }),
        { spend: 0, leads: 0, scheduled: 0, closed: 0, revenue: 0, cashCollected: 0, roas: 0 }
      );
      totals.roas = totals.spend > 0 ? totals.cashCollected / totals.spend : 0;

      const agencyData: AgencyData = {
        clients: clientDataArr,
        totals,
        lastUpdated: new Date().toISOString(),
      };

      await cacheSet(key, agencyData);
      return NextResponse.json(agencyData);
    }

    // ── Single client view ───────────────────────────────────────
    const key = cacheKey(clientId, dateRange);
    if (!refresh) {
      const cached = await cacheGet<ClientData>(key);
      if (cached) return NextResponse.json(cached);
    } else {
      await cacheDel(key);
    }

    const client = await getClientById(clientId);
    if (!client) throw new Error(`Client not found: ${clientId}`);

    const [meta, ghl] = await Promise.all([
      getMetaMetrics(client.adAccountId, dateRange),
      getGHLMetrics(client.ghlTag, client.payout, dateRange),
    ]);

    const roas = meta.spend > 0 ? ghl.cashCollected / meta.spend : 0;
    const data: ClientData = { clientId, meta, ghl, roas, lastUpdated: new Date().toISOString() };

    await cacheSet(key, data);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
