"use client";

import { useEffect, useMemo, useState } from "react";
import { KpiCards } from "@/components/KpiCards";
import { LanguagePie } from "@/components/LanguagePie";
import type { ClientKey } from "@/config/clients";
import type { DatePreset, DashboardMetrics, FunnelStage } from "@/types/metrics";

type ClientRow = {
  client: ClientKey;
  displayName: string;
  metrics: DashboardMetrics;
  language: { english: number; spanish: number };
};

const initial: DashboardMetrics = {
  adSpend: 0, impressions: 0, linkClicks: 0, cpc: 0, ctr: 0, cpl: 0, leads: 0,
  confirmed: 0, showed: 0, showRate: 0, dealsClosed: 0, closeRate: 0,
  revenue: 0, feeTiago: 0, cashCollectedClient: 0, roas: 0,
};

export default function DashboardPage() {
  const [client, setClient] = useState<ClientKey | "all">("all");
  const [stage, setStage] = useState<FunnelStage>("leads");
  const [datePreset, setDatePreset] = useState<DatePreset>("last_7_days");
  const [metrics, setMetrics] = useState<DashboardMetrics>(initial);
  const [language, setLanguage] = useState({ english: 0, spanish: 0 });
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [dark, setDark] = useState(true);

  const search = useMemo(() => new URLSearchParams({ client, stage, datePreset }).toString(), [client, stage, datePreset]);

  async function refreshNow() {
    const res = await fetch(`/api/dashboard?${search}`, { cache: "no-store" });
    const data = await res.json();
    setMetrics(data.metrics);
    setLanguage(data.language);
    setRows(data.clients ?? []);
  }

  useEffect(() => { void refreshNow(); }, [search]);

  return (
    <main className={`container ${dark ? "theme-dark" : "theme-light"}`}>
      <header className="header">
        <div><p className="eyebrow">Agency Dashboard</p><h1>SetToClose</h1></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setDark((v) => !v)}>{dark ? "Light" : "Dark"} mode</button>
          <button className="btn" onClick={refreshNow}>Refresh now</button>
        </div>
      </header>

      <section className="toolbar card">
        <label>Client
          <select value={client} onChange={(e) => setClient(e.target.value as ClientKey | "all")}>
            <option value="all">Agency View (All clients)</option>
            <option value="virginia">Virginia</option><option value="maryland">Maryland</option><option value="north_carolina">North Carolina</option><option value="south_carolina">South Carolina</option>
          </select>
        </label>
        <label>Stage
          <select value={stage} onChange={(e) => setStage(e.target.value as FunnelStage)}>
            <option value="leads">Leads</option><option value="confirmed">Confirmed</option><option value="showed">Showed</option><option value="closed">Closed</option>
          </select>
        </label>
        <label>Date Range
          <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)}>
            <option value="today">Today</option><option value="yesterday">Yesterday</option><option value="last_7_days">Last 7 days</option><option value="last_30_days">Last 30 days</option><option value="month_to_date">Current month</option><option value="custom">Custom</option>
          </select>
        </label>
      </section>

      <KpiCards metrics={metrics} />
      <LanguagePie english={language.english} spanish={language.spanish} />

      {rows.length > 0 && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Agency Breakdown</h3>
          <table className="table">
            <thead><tr><th>Client</th><th>Spend</th><th>Leads</th><th>Showed</th><th>Closed</th><th>Cash Collected</th><th>ROAS</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.client}>
                  <td>{row.displayName}</td><td>${row.metrics.adSpend.toFixed(0)}</td><td>{row.metrics.leads}</td><td>{row.metrics.showed}</td><td>{row.metrics.dealsClosed}</td><td>${row.metrics.cashCollectedClient.toFixed(0)}</td><td>{row.metrics.roas.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
