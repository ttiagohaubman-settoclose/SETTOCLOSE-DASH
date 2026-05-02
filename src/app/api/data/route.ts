import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientById, getClients } from "@/lib/clients";
import { getMetaMetrics } from "@/lib/meta";
import { getGHLMetrics, getAllContacts } from "@/lib/ghl";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import type { ClientData, AgencyData, DateRange, GHLMetrics } from "@/types";

function cacheKey(clientId: string, dateRange: DateRange) {
  return `cache:data:${clientId}:${dateRange.startDate}:${dateRange.endDate}`;
}

const EMPTY_GHL: GHLMetrics = {
  totalLeads: 0, scheduled: 0, showed: 0, closed: 0, paid: 0,
  showRate: null, closeRate: 0, revenue: 0, cashCollected: 0,
};

async function safeGHL(
  clientTag: string, payout: number, dateRange: DateRange, allContacts?: never[]
): Promise<{ ghl: GHLMetrics; ghlError?: string }> {
  try {
    const ghl = await getGHLMetrics(clientTag, payout, dateRange, allContacts);
    return { ghl };
  } catch (e) {
    return { ghl: EMPTY_GHL, ghlError: e instanceof Error ? e.message : "GHL error" };
  }
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
    return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
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

      // Fetch Meta (always) and GHL contacts (best-effort) in parallel
      let ghlErrorMsg: string | undefined;
      const [ghlResult, ...metaResults] = await Promise.all([
        getAllContacts(dateRange).catch((e) => {
          ghlErrorMsg = e instanceof Error ? e.message : "GHL error";
          return null;
        }),
        ...clients.map((c) => getMetaMetrics(c.adAccountId, dateRange)),
      ]);

      const allContacts = ghlResult ?? [];

      const clientDataArr: ClientData[] = await Promise.all(
        clients.map(async (c, i) => {
          const meta = metaResults[i];
          const { ghl } = await safeGHL(c.ghlTag, c.payout, dateRange, allContacts as never[]);
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

      const agencyData: AgencyData & { ghlError?: string } = {
        clients: clientDataArr,
        totals,
        lastUpdated: new Date().toISOString(),
        ...(ghlErrorMsg ? { ghlError: ghlErrorMsg } : {}),
      };

      if (!ghlErrorMsg) await cacheSet(key, agencyData);
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

    // Meta and GHL in parallel — GHL failure won't block Meta
    const [meta, { ghl, ghlError }] = await Promise.all([
      getMetaMetrics(client.adAccountId, dateRange),
      safeGHL(client.ghlTag, client.payout, dateRange),
    ]);

    const roas = meta.spend > 0 ? ghl.cashCollected / meta.spend : 0;
    const data: ClientData & { ghlError?: string } = {
      clientId, meta, ghl, roas,
      lastUpdated: new Date().toISOString(),
      ...(ghlError ? { ghlError } : {}),
    };

    // Only cache if GHL succeeded (so next request retries GHL)
    if (!ghlError) await cacheSet(key, data);
    return NextResponse.json(data);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
