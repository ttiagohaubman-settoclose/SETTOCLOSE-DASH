import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = process.env.GHL_API_TOKEN!;
  const locationId = process.env.GHL_LOCATION_ID!;

  const params = new URLSearchParams({
    locationId,
    limit: "10",
  });

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${GHL_BASE}/contacts/?${params}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
        "Content-Type": "application/json",
      },
    });

    const status = res.status;
    const body = await res.json();

    if (status !== 200) {
      return NextResponse.json({ ghl_status: status, error: body });
    }

    // Show all unique tags found across sample contacts
    const allTags = new Set<string>();
    (body.contacts ?? []).forEach((c: { tags: string[] }) =>
      c.tags.forEach((t: string) => allTags.add(t))
    );

    return NextResponse.json({
      ghl_status: status,
      total_contacts_in_page: body.contacts?.length ?? 0,
      meta: body.meta,
      unique_tags_found: Array.from(allTags).sort(),
      sample_contacts: (body.contacts ?? []).slice(0, 5).map((c: { id: string; firstName: string; tags: string[] }) => ({
        id: c.id,
        name: c.firstName,
        tags: c.tags,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
