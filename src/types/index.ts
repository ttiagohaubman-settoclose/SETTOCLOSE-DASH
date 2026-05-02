export interface Client {
  id: string;
  name: string;
  office: string;
  ghlTag: string;
  adAccountId: string;
  payout: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "client";
  clientId?: string;
  createdAt: string;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface MetaMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  leads: number;
  cpl: number;
}

export interface GHLMetrics {
  totalLeads: number;
  scheduled: number;
  showed: number;
  closed: number;
  paid: number;
  showRate: number | null;
  closeRate: number;
  revenue: number;
  cashCollected: number;
}

export interface ClientData {
  clientId: string;
  meta: MetaMetrics;
  ghl: GHLMetrics;
  roas: number;
  lastUpdated: string;
}

export interface AgencyData {
  clients: ClientData[];
  totals: {
    spend: number;
    leads: number;
    scheduled: number;
    closed: number;
    revenue: number;
    cashCollected: number;
    roas: number;
  };
  lastUpdated: string;
}

export type DatePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";
