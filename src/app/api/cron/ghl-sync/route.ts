import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redisSet } from "@/lib/redis";
import { format, subDays } from "date-fns";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

interface GHLContact {
  id: string;
  tags: string[];
  dateAdded: string;
}

// Fetch one page with a generous timeout (cron has 60s, not Vercel's 10s serverless limit)
async function fetchPage(startAfterId?: string, startDate?: string, endDate?: string) {
  const token = process.env.GHL_API_TOKEN!;
  const locationId = process.env.GHL_LOCATION_ID!;

  const params = new URLSearchParams({ locationId, limit: "100" });
  if (startDate) params.set("startDate", `${startDate}T00:00:00.000Z`);
  if (endDate)   params.set("endDate",   `${endDate}T23:59:59.999Z`);
  if (startAfterId) params.set("startAfterId", startAfterId);

  const res = await fetch(`${GHL_BASE}/contacts/?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllForRange(startDate: string, endDate: string): Promise<GHLContact[]> {
  const all: GHLContact[] = [];
  let startAfterId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchPage(startAfterId, startDate, endDate);
    const contacts: GHLContact[] = data.contacts ?? [];
    all.push(...contacts);

    if (contacts.length < 100) {
      hasMore = false;
    } else {
      startAfterId = contacts[contacts.length - 1]?.id;
      if (!startAfterId) hasMore = false;
    }
  }
  return all;
}

export async function GET(req: NextRequest) {
  // Allow: Vercel cron (bearer secret) OR logged-in admin
  const authHeader = req.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const today = new Date();
  const ranges = [
    { days: 7,   label: "7d"  },
    { days: 30,  label: "30d" },
    { days: 60,  label: "60d" },
    { days: 90,  label: "90d" },
  ];

  const results: Record<string, number> = {};

  for (const range of ranges) {
    const startDate = format(subDays(today, range.days - 1), "yyyy-MM-dd");
    const endDate = format(today, "yyyy-MM-dd");
    const key = `ghl:contacts:${startDate}:${endDate}`;

    try {
      const contacts = await fetchAllForRange(startDate, endDate);
      // TTL: 2 hours so the next cron run replaces it
      await redisSet(key, contacts);
      results[range.label] = contacts.length;
    } catch (e) {
      results[range.label] = -1;
      console.error(`GHL sync failed for ${range.label}:`, e);
    }
  }

  return NextResponse.json({ synced: true, ranges: results, ts: new Date().toISOString() });
}
