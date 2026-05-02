import type { DashboardMetrics } from "@/types/metrics";

type Props = { metrics: DashboardMetrics };

export function KpiCards({ metrics }: Props) {
  const rows = [
    ["Ad Spend", `$${metrics.adSpend.toFixed(2)}`],
    ["Leads", `${metrics.leads}`],
    ["Confirmed", `${metrics.confirmed}`],
    ["Showed", `${metrics.showed}`],
    ["Show Rate", `${(metrics.showRate * 100).toFixed(1)}%`],
    ["Deals Closed", `${metrics.dealsClosed}`],
    ["Cash Collected", `$${metrics.cashCollectedClient.toFixed(2)}`],
    ["ROAS", `${metrics.roas.toFixed(2)}x`],
  ];

  return <div className="grid grid-4">{rows.map(([label, value]) => <div key={label} className="card"><div>{label}</div><strong>{value}</strong></div>)}</div>;
}
