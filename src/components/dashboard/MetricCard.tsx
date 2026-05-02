import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  className?: string;
}

export function MetricCard({ label, value, subtext, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        "border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-600">
          {subtext}
        </p>
      )}
    </div>
  );
}

interface MetricSectionProps {
  title: string;
  children: React.ReactNode;
}

export function MetricSection({ title, children }: MetricSectionProps) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </div>
    </div>
  );
}
