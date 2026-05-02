# SETTOCLOSE-DASH

Initial project blueprint and business rules for a Next.js + Vercel + Upstash dashboard.

## Confirmed definitions (May 2, 2026)

- Leads source: Meta Ads (100%).
- Date ranges: today, yesterday, last 7 days, last 30 days, current month, custom.
- Show Rate = showed / confirmed.
- Close Rate = deals closed / showed.
- Revenue per sale:
  - Virginia, North Carolina, South Carolina: $3000
  - Maryland: $2800
- Fee Tiago per sale:
  - Virginia, North Carolina, South Carolina: $750
  - Maryland: $500
- Cash Collected (client) = Revenue - Ad Spend - Fee Tiago.
- ROAS = Cash Collected (client) / Ad Spend.

## Current step delivered

- Client configuration constants in `src/config/clients.ts`.
- Typed metrics contracts in `src/types/metrics.ts`.
- Metrics engine in `src/lib/metrics.ts`.

## Next implementation step

1. Scaffold Next.js App Router pages and API routes.
2. Add Auth.js with Admin and Client User roles.
3. Integrate Meta Ads and GHL data connectors.
4. Add Redis caching and `Refresh now` invalidation.
5. Build minimal UI with client dropdown, date picker, KPI cards, and language pie chart.
