import type { ClientConfig } from "@/config/clients";
import type { DashboardMetrics, GhlMetrics, MetaMetrics } from "@/types/metrics";

const safeDivide = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  return numerator / denominator;
};

/**
 * Business rules confirmed with stakeholder (May 2, 2026):
 * - Show Rate = showed / confirmed
 * - Close Rate = dealsClosed / showed
 * - Revenue = dealsClosed * client.revenuePerSale
 * - Fee Tiago = dealsClosed * client.feeTiagoPerSale
 * - Cash Collected (client) = revenue - adSpend - feeTiago
 * - ROAS = cashCollectedClient / adSpend
 */
export const buildDashboardMetrics = (
  client: ClientConfig,
  meta: MetaMetrics,
  ghl: GhlMetrics,
): DashboardMetrics => {
  const revenue = ghl.dealsClosed * client.revenuePerSale;
  const feeTiago = ghl.dealsClosed * client.feeTiagoPerSale;
  const cashCollectedClient = revenue - meta.spend - feeTiago;

  return {
    adSpend: meta.spend,
    impressions: meta.impressions,
    linkClicks: meta.linkClicks,
    cpc: safeDivide(meta.spend, meta.linkClicks),
    ctr: safeDivide(meta.linkClicks, meta.impressions),
    cpl: safeDivide(meta.spend, meta.leads),
    leads: meta.leads,
    confirmed: ghl.confirmed,
    showed: ghl.showed,
    showRate: safeDivide(ghl.showed, ghl.confirmed),
    dealsClosed: ghl.dealsClosed,
    closeRate: safeDivide(ghl.dealsClosed, ghl.showed),
    revenue,
    feeTiago,
    cashCollectedClient,
    roas: safeDivide(cashCollectedClient, meta.spend),
  };
};
