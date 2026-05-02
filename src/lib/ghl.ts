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
  meta?: {
    total?: number;
    nextPage?: number | null;
    startAfterId?: string;
  };
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

  const res = await fetch(`${GHL_BASE}/contacts/?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 },
  });

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

// Returns all GHL contacts for the location, cached in Redis
export async function getAllContacts(dateRange: DateRange): Promise<GHLContact[]> {
  const key = `ghl:contacts:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await cacheGet<GHLContact[]>(key);
  if (cached) return cached;

  const contacts = await fetchAllContactsFromGHL(dateRange);
  await cacheSet(key, contacts);
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

  const totalLeads = contacts.length;
  const scheduled = contacts.filter((c) => c.tags.includes("scheduled")).length;
  const showed    = contacts.filter((c) => c.tags.includes("showed")).length;
  const closed    = contacts.filter((c) => c.tags.includes("venta")).length;
  const paid      = contacts.filter((c) => c.tags.includes("pagada")).length;

  const showRate    = scheduled > 0 ? (showed / scheduled) * 100 : null;
  const closeRate   = scheduled > 0 ? (closed / scheduled) * 100 : 0;
  const revenue     = closed * payout;
  const cashCollected = paid * payout;

  return { totalLeads, scheduled, showed, closed, paid, showRate, closeRate, revenue, cashCollected };
}
