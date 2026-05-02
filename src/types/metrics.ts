export type FunnelStage = "leads" | "confirmed" | "showed" | "closed";

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "month_to_date"
  | "custom";

export type MetaMetrics = {
  spend: number;
  impressions: number;
  linkClicks: number;
  leads: number;
};

export type GhlMetrics = {
  confirmed: number;
  showed: number;
  dealsClosed: number;
  english: number;
  spanish: number;
};

export type DashboardMetrics = {
  adSpend: number;
  impressions: number;
  linkClicks: number;
  cpc: number;
  ctr: number;
  cpl: number;
  leads: number;
  confirmed: number;
  showed: number;
  showRate: number;
  dealsClosed: number;
  closeRate: number;
  revenue: number;
  feeTiago: number;
  cashCollectedClient: number;
  roas: number;
};

export type ClientDashboardResponse = {
  metrics: DashboardMetrics;
  language: { english: number; spanish: number };
};
