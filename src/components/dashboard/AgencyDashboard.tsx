"use client";

import useSWR from "swr";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricCard, MetricSection } from "./MetricCard";
import { Header } from "@/components/layout/Header";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  getDateRange,
  cn,
} from "@/lib/utils";
import type { AgencyData, DateRange, DatePreset } from "@/types";

const REFRESH_INTERVAL = Number(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 300000
);

async function fetcher(url: string): Promise<AgencyData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function AgencyDashboard() {
  const [preset, setPreset] = useState<DatePreset>("last30");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("last30"));
  const [refreshKey, setRefreshKey] = useState(0);

  const url = `/api/data?clientId=agency&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

  const { data, isLoading, mutate } = useSWR<AgencyData>(
    [url, refreshKey],
    ([u]) => fetcher(u as string),
    { refreshInterval: REFRESH_INTERVAL }
  );

  const handleRefresh = useCallback(async () => {
    await fetch(
      `/api/data?clientId=agency&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&refresh=true`
    );
    await mutate();
    setRefreshKey((k) => k + 1);
  }, [dateRange, mutate]);

  const handleDateChange = useCallback((range: DateRange, p: DatePreset) => {
    setDateRange(range);
    setPreset(p);
  }, []);

  const totals = data?.totals;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Agency Overview"
        subtitle="All clients consolidated"
        dateRange={dateRange}
        preset={preset}
        onDateChange={handleDateChange}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        lastUpdated={data?.lastUpdated}
      />

      <main className="flex-1 px-8 py-6 space-y-8">
        {isLoading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        )}

        {data && (
          <>
            {/* Agency Totals */}
            <MetricSection title="Totals">
              <MetricCard
                label="Total Spend"
                value={formatCurrency(totals?.spend ?? 0)}
              />
              <MetricCard
                label="Total Leads"
                value={formatNumber(totals?.leads ?? 0)}
              />
              <MetricCard
                label="Total Scheduled"
                value={formatNumber(totals?.scheduled ?? 0)}
              />
              <MetricCard
                label="Deals Closed"
                value={formatNumber(totals?.closed ?? 0)}
              />
              <MetricCard
                label="Revenue"
                value={formatCurrency(totals?.revenue ?? 0)}
              />
              <MetricCard
                label="Cash Collected"
                value={formatCurrency(totals?.cashCollected ?? 0)}
              />
              <MetricCard
                label="Blended ROAS"
                value={formatRoas(totals?.roas ?? 0)}
              />
            </MetricSection>

            {/* Per Client */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                By Client
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.clients.map((client) => (
                  <Link
                    key={client.clientId}
                    href={`/dashboard/${client.clientId}`}
                    className={cn(
                      "group block rounded-xl border p-5 transition-colors",
                      "border-neutral-200 dark:border-neutral-800",
                      "bg-white dark:bg-neutral-900",
                      "hover:border-neutral-300 dark:hover:border-neutral-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-neutral-900 dark:text-white capitalize">
                        {client.clientId}
                      </p>
                      <ArrowRight
                        size={16}
                        className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          Spend
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatCurrency(client.meta.spend)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          Leads
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(client.meta.leads)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          Closed
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatNumber(client.ghl.closed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          Revenue
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatCurrency(client.ghl.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          Collected
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatCurrency(client.ghl.cashCollected)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                          ROAS
                        </p>
                        <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                          {formatRoas(client.roas)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
