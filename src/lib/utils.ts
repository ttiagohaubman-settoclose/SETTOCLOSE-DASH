import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
} from "date-fns";
import type { DatePreset, DateRange } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getDateRange(preset: DatePreset): DateRange {
  const today = new Date();

  switch (preset) {
    case "today":
      return {
        startDate: format(startOfToday(), "yyyy-MM-dd"),
        endDate: format(endOfToday(), "yyyy-MM-dd"),
      };
    case "yesterday":
      return {
        startDate: format(startOfYesterday(), "yyyy-MM-dd"),
        endDate: format(endOfYesterday(), "yyyy-MM-dd"),
      };
    case "last7":
      return {
        startDate: format(subDays(today, 6), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "last14":
      return {
        startDate: format(subDays(today, 13), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "last30":
      return {
        startDate: format(subDays(today, 29), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "thisMonth":
      return {
        startDate: format(startOfMonth(today), "yyyy-MM-dd"),
        endDate: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "lastMonth": {
      const lastMonth = subMonths(today, 1);
      return {
        startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    }
    default:
      return {
        startDate: format(subDays(today, 29), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
  }
}

export function presetLabel(preset: DatePreset): string {
  const labels: Record<DatePreset, string> = {
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 Days",
    last14: "Last 14 Days",
    last30: "Last 30 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    custom: "Custom",
  };
  return labels[preset];
}
