"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn, getDateRange, presetLabel } from "@/lib/utils";
import type { DateRange, DatePreset } from "@/types";

const PRESETS: DatePreset[] = [
  "today",
  "yesterday",
  "last7",
  "last14",
  "last30",
  "thisMonth",
  "lastMonth",
  "custom",
];

interface DateRangePickerProps {
  dateRange: DateRange;
  preset: DatePreset;
  onChange: (range: DateRange, preset: DatePreset) => void;
}

export function DateRangePicker({ dateRange, preset, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handlePreset(p: DatePreset) {
    if (p === "custom") {
      setOpen(true);
      return;
    }
    const range = getDateRange(p);
    onChange(range, p);
    setOpen(false);
  }

  function handleCustomApply() {
    if (customStart && customEnd) {
      onChange({ startDate: customStart, endDate: customEnd }, "custom");
      setOpen(false);
    }
  }

  const label =
    preset === "custom"
      ? `${dateRange.startDate} → ${dateRange.endDate}`
      : presetLabel(preset);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors",
          "border-neutral-200 dark:border-neutral-800",
          "text-neutral-700 dark:text-neutral-300",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "bg-white dark:bg-neutral-900"
        )}
      >
        {label}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1 w-52 rounded-xl border shadow-lg z-50",
            "border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900"
          )}
        >
          <div className="p-1">
            {PRESETS.filter((p) => p !== "custom").map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  preset === p
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}
              >
                {presetLabel(p)}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Custom range
            </p>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={cn(
                "w-full px-2 py-1.5 text-sm rounded-md border",
                "border-neutral-200 dark:border-neutral-700",
                "bg-neutral-50 dark:bg-neutral-800",
                "text-neutral-900 dark:text-white"
              )}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={cn(
                "w-full px-2 py-1.5 text-sm rounded-md border",
                "border-neutral-200 dark:border-neutral-700",
                "bg-neutral-50 dark:bg-neutral-800",
                "text-neutral-900 dark:text-white"
              )}
            />
            <button
              onClick={handleCustomApply}
              className="w-full px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
