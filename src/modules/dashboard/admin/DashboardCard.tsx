import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

//* Shared shell for every dashboard panel: same padding, header and radius.
export default function DashboardCard({
  title,
  subtitle,
  action,
  icon,
  className,
  bodyClassName,
  children,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-white ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(103,124,34,0.18)] p-4 sm:p-5 flex flex-col gap-4 min-w-0",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className="h-9 w-9 shrink-0 rounded-xl bg-greenPrimary-950 text-greenPrimary-600 flex items-center justify-center">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutralPrimary-800 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-neutralPrimary-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-32 flex items-center justify-center text-sm text-neutralPrimary-400 text-center px-4">
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "sm",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-0.5 rounded-xl bg-neutralPrimary-100 p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-greenPrimary-500",
            size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5",
            value === o.value
              ? "bg-white text-greenPrimary-600 shadow-sm"
              : "text-neutralPrimary-500 hover:text-neutralPrimary-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
