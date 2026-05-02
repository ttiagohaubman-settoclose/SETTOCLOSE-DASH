"use client";

import useSWR from "swr";
import { useState, useCallback } from "react";
import { MetricCard, MetricSection } from "./MetricCard";
import { Header } from "@/components/layout/Header";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  getDateRange,
} from "@/lib/utils";
import type { ClientData, DateRange, DatePreset } from "@/types";

type ClientDataWithError = ClientData & { ghlError?: string };

const REFRESH_INTERVAL = Number(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 300000
);

async function fetcher(url: string): Promise<ClientDataWithError> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
  return json;
}

interface ClientDashboardProps {
  clientId: string;
  clientName: string;
  office: string;
}

export function ClientDashboard({
  clientId,
  clientName,
  office,
}: ClientDashboardProps) {
  const [preset, setPreset] = useState<DatePreset>("last30");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("last30"));
  const [refreshKey, setRefreshKey] = useState(0);

  const url = `/api/data?clientId=${clientId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

  const { data, error, isLoading, mutate } = useSWR<ClientDataWithError>(
    [url, refreshKey],
    ([u]) => fetcher(u as string),
    { refreshInterval: REFRESH_INTERVAL }
  );

  const handleRefresh = useCallback(async () => {
    await fetch(
      `/api/data?clientId=${clientId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&refresh=true`
    );
    await mutate();
    setRefreshKey((k) => k + 1);
  }, [clientId, dateRange, mutate]);

  const handleDateChange = useCallback(
    (range: DateRange, p: DatePreset) => {
      setDateRange(range);
      setPreset(p);
    },
    []
  );

  const meta = data?.meta;
  const ghl = data?.ghl;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={clientName}
        subtitle={office}
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

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-5">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Error al cargar datos</p>
            <p className="mt-1 text-xs text-red-500 dark:text-red-500 font-mono">{error.message}</p>
          </div>
        )}

        {data?.ghlError && (
          <div className="rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30 px-4 py-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              GHL no disponible — mostrando datos de Meta solamente. Se reintentará en el próximo refresh.
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Meta Ads */}
            <MetricSection title="Meta Ads">
              <MetricCard
                label="Ad Spend"
                value={formatCurrency(meta?.spend ?? 0)}
              />
              <MetricCard
                label="Impressions"
                value={formatNumber(meta?.impressions ?? 0)}
              />
              <MetricCard
                label="Link Clicks"
                value={formatNumber(meta?.clicks ?? 0)}
              />
              <MetricCard
                label="CPC"
                value={formatCurrency(meta?.cpc ?? 0)}
              />
              <MetricCard
                label="CTR"
                value={formatPercent(meta?.ctr ?? 0)}
              />
              <MetricCard
                label="Leads"
                value={formatNumber(meta?.leads ?? 0)}
              />
              <MetricCard
                label="CPL"
                value={formatCurrency(meta?.cpl ?? 0)}
              />
            </MetricSection>

            {/* GHL Pipeline */}
            <MetricSection title="Pipeline">
              <MetricCard
                label="GHL Leads"
                value={formatNumber(ghl?.totalLeads ?? 0)}
              />
              <MetricCard
                label="Scheduled"
                value={formatNumber(ghl?.scheduled ?? 0)}
              />
              <MetricCard
                label="Show Rate"
                value={
                  ghl?.showRate !== null && ghl?.showRate !== undefined
                    ? formatPercent(ghl.showRate)
                    : "N/A"
                }
                subtext={
                  ghl?.showRate === null ? "Add 'showed' tag in GHL" : undefined
                }
              />
              <MetricCard
                label="Deals Closed"
                value={formatNumber(ghl?.closed ?? 0)}
              />
              <MetricCard
                label="Close Rate"
                value={formatPercent(ghl?.closeRate ?? 0)}
              />
            </MetricSection>

            {/* Revenue */}
            <MetricSection title="Revenue">
              <MetricCard
                label="Revenue"
                value={formatCurrency(ghl?.revenue ?? 0)}
              />
              <MetricCard
                label="Cash Collected"
                value={formatCurrency(ghl?.cashCollected ?? 0)}
              />
              <MetricCard
                label="ROAS"
                value={formatRoas(data?.roas ?? 0)}
                subtext="Cash Collected / Ad Spend"
              />
            </MetricSection>
          </>
        )}
      </main>
    </div>
  );
}
