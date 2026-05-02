import type { GHLMetrics, DateRange } from "@/types";

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
    startAfter?: number;
    startAfterId?: string;
  };
}

async function fetchAllContacts(
  tag: string,
  dateRange: DateRange
): Promise<GHLContact[]> {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const allContacts: GHLContact[] = [];
  let startAfterId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      locationId: locationId!,
      limit: "100",
      startDate: `${dateRange.startDate}T00:00:00.000Z`,
      endDate: `${dateRange.endDate}T23:59:59.999Z`,
      tags: tag,
    });

    if (startAfterId) {
      params.set("startAfterId", startAfterId);
    }

    const res = await fetch(
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

    const data: GHLContactsResponse = await res.json();
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

export async function getGHLMetrics(
  clientTag: string,
  payout: number,
  dateRange: DateRange
): Promise<GHLMetrics> {
  const contacts = await fetchAllContacts(clientTag, dateRange);

  const totalLeads = contacts.length;
  const scheduled = contacts.filter((c) => c.tags.includes("scheduled")).length;
  const showed = contacts.filter((c) => c.tags.includes("showed")).length;
  const closed = contacts.filter((c) => c.tags.includes("venta")).length;
  const paid = contacts.filter((c) => c.tags.includes("pagada")).length;

  const showRate = scheduled > 0 ? (showed / scheduled) * 100 : null;
  const closeRate = scheduled > 0 ? (closed / scheduled) * 100 : 0;
  const revenue = closed * payout;
  const cashCollected = paid * payout;

  return {
    totalLeads,
    scheduled,
    showed,
    closed,
    paid,
    showRate,
    closeRate,
    revenue,
    cashCollected,
  };
}
