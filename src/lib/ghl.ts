import type { GHLMetrics, DateRange } from "@/types";
import { cacheGet, cacheSet } from "./redis";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

interface GHLContact {
  id: string;
  tags: string[];
  dateAdded: string;
}

interface GHLContactsResponse {
  contacts: GHLContact[];
  meta?: { startAfterId?: string };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 4): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    // exponential backoff: 2s, 4s, 8s, 16s
    const wait = Math.pow(2, i + 1) * 1000;
    console.warn(`GHL 429 rate limit, retrying in ${wait}ms (attempt ${i + 1}/${retries})`);
    await sleep(wait);
  }
  // final attempt
  return fetch(url, options);
}

async function fetchPage(
  locationId: string,
  token: string,
  dateRange: DateRange,
  startAfterId?: string
): Promise<GHLContactsResponse> {
  const params = new URLSearchParams({
    locationId,
    limit: "100",
    startDate: `${dateRange.startDate}T00:00:00.000Z`,
    endDate: `${dateRange.endDate}T23:59:59.999Z`,
  });
  if (startAfterId) params.set("startAfterId", startAfterId);

  const res = await fetchWithRetry(
    `${GHL_BASE}/contacts/?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function fetchAllContactsFromGHL(dateRange: DateRange): Promise<GHLContact[]> {
  const token = process.env.GHL_API_TOKEN!;
  const locationId = process.env.GHL_LOCATION_ID!;
  const allContacts: GHLContact[] = [];
  let startAfterId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchPage(locationId, token, dateRange, startAfterId);
    const contacts = data.contacts ?? [];
    allContacts.push(...contacts);

    if (contacts.length < 100) {
      hasMore = false;
    } else {
      startAfterId = contacts[contacts.length - 1]?.id;
      if (!startAfterId) hasMore = false;
    }
  }

  return allContacts;
}

export async function getAllContacts(dateRange: DateRange): Promise<GHLContact[]> {
  const key = `ghl:contacts:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await cacheGet<GHLContact[]>(key);
  if (cached) return cached;

  const contacts = await fetchAllContactsFromGHL(dateRange);
  // Cache for 10 minutes to aggressively avoid rate limits
  await cacheSet(key, contacts, 600);
  return contacts;
}

export async function getGHLMetrics(
  clientTag: string,
  payout: number,
  dateRange: DateRange,
  allContacts?: GHLContact[]
): Promise<GHLMetrics> {
  const contacts = (allContacts ?? await getAllContacts(dateRange))
    .filter((c) => c.tags.includes(clientTag));

  const totalLeads     = contacts.length;
  const scheduled      = contacts.filter((c) => c.tags.includes("scheduled")).length;
  const showed         = contacts.filter((c) => c.tags.includes("showed")).length;
  const closed         = contacts.filter((c) => c.tags.includes("venta")).length;
  const paid           = contacts.filter((c) => c.tags.includes("pagada")).length;
  const showRate       = scheduled > 0 ? (showed / scheduled) * 100 : null;
  const closeRate      = scheduled > 0 ? (closed / scheduled) * 100 : 0;
  const revenue        = closed * payout;
  const cashCollected  = paid * payout;

  return { totalLeads, scheduled, showed, closed, paid, showRate, closeRate, revenue, cashCollected };
}
