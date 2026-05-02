import type { MetaMetrics, DateRange } from "@/types";
import { cacheGet, cacheSet } from "./redis";

const META_BASE = "https://graph.facebook.com/v19.0";
const META_CACHE_TTL = 900; // 15 minutes

interface MetaAction {
  action_type: string;
  value: string;
}

interface MetaInsight {
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  ctr?: string;
  actions?: MetaAction[];
}

interface MetaInsightsResponse {
  data: MetaInsight[];
  error?: { message: string; type: string };
}

function extractLeads(actions: MetaAction[] = []): number {
  const leadTypes = [
    "lead",
    "offsite_conversion.fb_pixel_lead",
    "onsite_web_lead",
    "leadgen_grouped",
  ];
  return actions
    .filter((a) => leadTypes.includes(a.action_type))
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
}

export async function getMetaMetrics(
  adAccountId: string,
  dateRange: DateRange
): Promise<MetaMetrics> {
  const cacheKey = `meta:${adAccountId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await cacheGet<MetaMetrics>(cacheKey);
  if (cached) return cached;

  const token = process.env.META_ACCESS_TOKEN;

  const params = new URLSearchParams({
    fields: "spend,impressions,clicks,cpc,ctr,actions",
    time_range: JSON.stringify({
      since: dateRange.startDate,
      until: dateRange.endDate,
    }),
    level: "account",
    access_token: token!,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(
      `${META_BASE}/act_${adAccountId}/insights?${params.toString()}`,
      { signal: controller.signal, next: { revalidate: 0 } }
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API error ${res.status}: ${text}`);
  }

  const json: MetaInsightsResponse = await res.json();

  if (json.error) {
    throw new Error(`Meta API error: ${json.error.message}`);
  }

  const insight = json.data?.[0];

  if (!insight) {
    return {
      spend: 0,
      impressions: 0,
      clicks: 0,
      cpc: 0,
      ctr: 0,
      leads: 0,
      cpl: 0,
    };
  }

  const spend = parseFloat(insight.spend ?? "0");
  const impressions = parseInt(insight.impressions ?? "0", 10);
  const clicks = parseInt(insight.clicks ?? "0", 10);
  const cpc = parseFloat(insight.cpc ?? "0");
  const ctr = parseFloat(insight.ctr ?? "0");
  const leads = extractLeads(insight.actions);
  const cpl = leads > 0 ? spend / leads : 0;

  const metrics: MetaMetrics = { spend, impressions, clicks, cpc, ctr, leads, cpl };
  await cacheSet(cacheKey, metrics, META_CACHE_TTL);
  return metrics;
}
