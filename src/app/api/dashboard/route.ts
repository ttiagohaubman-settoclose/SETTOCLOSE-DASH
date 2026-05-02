import { NextRequest, NextResponse } from "next/server";
import { CLIENTS, type ClientKey } from "@/config/clients";
import { buildDashboardMetrics } from "@/lib/metrics";

const MOCK = {
  virginia: { meta: { spend: 1320, impressions: 28000, linkClicks: 860, leads: 61 }, ghl: { confirmed: 52, showed: 38, dealsClosed: 10, english: 21, spanish: 17 } },
  maryland: { meta: { spend: 980, impressions: 19000, linkClicks: 590, leads: 43 }, ghl: { confirmed: 36, showed: 24, dealsClosed: 6, english: 8, spanish: 16 } },
  north_carolina: { meta: { spend: 1180, impressions: 23500, linkClicks: 710, leads: 55 }, ghl: { confirmed: 42, showed: 30, dealsClosed: 7, english: 15, spanish: 15 } },
  south_carolina: { meta: { spend: 1070, impressions: 21000, linkClicks: 650, leads: 48 }, ghl: { confirmed: 39, showed: 27, dealsClosed: 8, english: 11, spanish: 16 } },
} as const;

export async function GET(req: NextRequest) {
  const selected = (req.nextUrl.searchParams.get("client") ?? "all") as ClientKey | "all";

  const perClient = CLIENTS.map((client) => {
    const snap = MOCK[client.key];
    return {
      client: client.key,
      displayName: client.displayName,
      metrics: buildDashboardMetrics(client, snap.meta, snap.ghl),
      language: { english: snap.ghl.english, spanish: snap.ghl.spanish },
    };
  });

  if (selected !== "all") {
    const row = perClient.find((entry) => entry.client === selected) ?? perClient[0];
    return NextResponse.json({ view: "client", ...row });
  }

  const totals = perClient.reduce(
    (acc, row) => {
      acc.adSpend += row.metrics.adSpend;
      acc.impressions += row.metrics.impressions;
      acc.linkClicks += row.metrics.linkClicks;
      acc.leads += row.metrics.leads;
      acc.confirmed += row.metrics.confirmed;
      acc.showed += row.metrics.showed;
      acc.dealsClosed += row.metrics.dealsClosed;
      acc.revenue += row.metrics.revenue;
      acc.feeTiago += row.metrics.feeTiago;
      acc.cashCollectedClient += row.metrics.cashCollectedClient;
      acc.english += row.language.english;
      acc.spanish += row.language.spanish;
      return acc;
    },
    { adSpend: 0, impressions: 0, linkClicks: 0, leads: 0, confirmed: 0, showed: 0, dealsClosed: 0, revenue: 0, feeTiago: 0, cashCollectedClient: 0, english: 0, spanish: 0 },
  );

  const metrics = {
    ...totals,
    cpc: totals.linkClicks ? totals.adSpend / totals.linkClicks : 0,
    ctr: totals.impressions ? totals.linkClicks / totals.impressions : 0,
    cpl: totals.leads ? totals.adSpend / totals.leads : 0,
    showRate: totals.confirmed ? totals.showed / totals.confirmed : 0,
    closeRate: totals.showed ? totals.dealsClosed / totals.showed : 0,
    roas: totals.adSpend ? totals.cashCollectedClient / totals.adSpend : 0,
  };

  return NextResponse.json({ view: "agency", metrics, language: { english: totals.english, spanish: totals.spanish }, clients: perClient });
}
