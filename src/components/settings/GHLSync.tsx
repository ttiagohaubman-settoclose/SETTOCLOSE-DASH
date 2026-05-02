"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function GHLSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/ghl-sync");
      const data = await res.json();
      if (res.ok && data.synced) {
        const counts = Object.entries(data.ranges as Record<string, number>)
          .map(([k, v]) => `${k}: ${v} contacts`)
          .join(", ");
        setResult({ ok: true, msg: `Sync OK — ${counts}` });
      } else {
        setResult({ ok: false, msg: data.error ?? "Sync failed" });
      }
    } catch (e) {
      setResult({ ok: false, msg: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            GHL Data Sync
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Syncs GHL contacts to Redis. Runs automatically every hour.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
            "border-neutral-200 dark:border-neutral-700",
            "text-neutral-700 dark:text-neutral-300",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          {loading ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {result && (
        <div className={cn(
          "flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs",
          result.ok
            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
        )}>
          {result.ok ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
          <span className="font-mono">{result.msg}</span>
        </div>
      )}
    </div>
  );
}
