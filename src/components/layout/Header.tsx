"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import type { DateRange, DatePreset } from "@/types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  dateRange: DateRange;
  preset: DatePreset;
  onDateChange: (range: DateRange, preset: DatePreset) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export function Header({
  title,
  subtitle,
  dateRange,
  preset,
  onDateChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: HeaderProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="sticky top-0 z-30 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {formattedTime && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600">
              Updated {formattedTime}
            </span>
          )}

          <DateRangePicker
            dateRange={dateRange}
            preset={preset}
            onChange={onDateChange}
          />

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors",
              "border-neutral-200 dark:border-neutral-800",
              "text-neutral-600 dark:text-neutral-400",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw
              size={14}
              className={cn(isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
