"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  IProductRef,
  IWarehouseRef,
} from "@/modules/inventory/types/inventory.types";

type Badge = { label: string; pill: string; dot: string };

/** Coloured status pill used across the inventory tables and detail modals. */
export function StatusBadge({ badge, className }: { badge: Badge; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        badge.pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
      {badge.label}
    </span>
  );
}

/** Product name (with its size, for one size of a VARIABLE product) and SKU underneath. */
export function ProductCell({ product }: { product: IProductRef }) {
  return (
    <div className="flex min-w-[10rem] max-w-[18rem] flex-col">
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className="truncate font-medium text-neutralPrimary-800"
          title={product.name}
        >
          {product.name}
        </span>
        {product.size && (
          <span className="shrink-0 rounded-full bg-purpleSecondary-100 px-2 py-0.5 text-[11px] font-semibold text-purpleSecondary-500">
            {product.size}
          </span>
        )}
      </span>
      <span className="text-xs text-neutralPrimary-400">
        {product.sku ?? `#${product.id}`}
        {product.status !== "ACTIVE" && ` · ${product.status.toLowerCase()}`}
        {product.sizeStatus === "INACTIVE" && " · size inactive"}
        {product.sizeStatus === "ARCHIVED" && " · size removed"}
      </span>
    </div>
  );
}

/** Warehouse code with its name; non-sellable locations are marked. */
export function WarehouseCell({ warehouse }: { warehouse: IWarehouseRef }) {
  return (
    <div className="flex min-w-[7rem] flex-col">
      <span className="font-mono text-xs font-semibold tracking-wide text-neutralPrimary-700">
        {warehouse.code}
      </span>
      <span className="truncate text-xs text-neutralPrimary-400" title={warehouse.name}>
        {warehouse.isSellable ? warehouse.name : `${warehouse.name} · not sellable`}
      </span>
    </div>
  );
}

/** "+250" in green, "-30" in red. */
export function QtyDelta({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        value > 0 ? "text-success-600" : value < 0 ? "text-destructive-600" : "text-neutralPrimary-500",
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toLocaleString("en-US")}
    </span>
  );
}

/** The white card that holds a tab's filters. */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutralPrimary-200 bg-white p-3 shadow-neutral02">
      {children}
    </div>
  );
}

/** A compact native select for list filters ("" = all). */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-[10rem] flex-col gap-1 text-xs font-semibold text-neutralPrimary-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer rounded-lg border border-neutralPrimary-300 bg-neutralPrimary-50 px-3 text-sm font-normal text-neutralPrimary-700 outline-none transition-all focus:border-greenPrimary-400 focus:bg-white focus:ring-4 focus:ring-greenPrimary-500/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A checkbox filter styled like the selects. */
export function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-neutralPrimary-300 bg-neutralPrimary-50 px-3 text-sm text-neutralPrimary-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-greenPrimary-500"
      />
      {label}
    </label>
  );
}

const ACTION_VARIANTS = {
  primary: "bg-greenPrimary-500 text-white hover:bg-greenPrimary-600 focus-visible:ring-greenPrimary-500/25",
  secondary:
    "border border-neutralPrimary-300 bg-white text-neutralPrimary-700 hover:bg-neutralPrimary-50 focus-visible:ring-neutralPrimary-300/40",
  danger: "border border-destructive-200 bg-white text-destructive-600 hover:bg-destructive-50 focus-visible:ring-destructive-500/20",
  info: "bg-blueSecondary-600 text-white hover:opacity-90 focus-visible:ring-blueSecondary-600/25",
} as const;

/** Small action button with an optional icon and a busy state. */
export function ActionButton({
  children,
  icon,
  onClick,
  variant = "secondary",
  disabled,
  isPending,
  type = "button",
  title,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: keyof typeof ACTION_VARIANTS;
  disabled?: boolean;
  isPending?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isPending}
      title={title}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
        ACTION_VARIANTS[variant],
      )}
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

/** Title block at the top of a modal. */
export function ModalTitle({
  title,
  subtitle,
  aside,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutralPrimary-100 pb-4">
      <div className="min-w-0">
        <p className="text-xl font-semibold text-neutralPrimary-800 sm:text-2xl">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-neutralPrimary-500">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

/** Label / value pairs in a responsive grid. */
export function DetailGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-neutralPrimary-100 bg-neutralPrimary-50/60 p-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
            {item.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-medium text-neutralPrimary-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A simple bordered table for document lines inside modals. */
export function LinesTable({
  headers,
  children,
}: {
  headers: { label: string; align?: "right" }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutralPrimary-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutralPrimary-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h.label}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutralPrimary-500",
                  h.align === "right" ? "text-right" : "text-left",
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutralPrimary-100">{children}</tbody>
      </table>
    </div>
  );
}

/** A tinted explanation box. */
export function Callout({
  tone = "info",
  icon,
  children,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const tones = {
    info: "bg-blueSecondary-50 text-blueSecondary-600 ring-blueSecondary-600/15",
    warning: "bg-warningPrimary-50 text-warningPrimary-800 ring-warningPrimary-600/20",
    danger: "bg-destructive-50 text-destructive-700 ring-destructive-600/15",
    success: "bg-success-100 text-success-600 ring-success-600/15",
  };
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm ring-1 ring-inset", tones[tone])}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Row of icon buttons in a table's Action column. */
export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

/** Wide and form modal widths shared by every inventory modal. */
export const MODAL_WIDTH = {
  form: "w-[calc(100vw-1.5rem)] sm:w-[88vw] md:w-[78vw] lg:w-[68vw] max-w-4xl",
  view: "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[82vw] lg:w-[72vw] max-w-5xl",
  small: "w-[calc(100vw-1.5rem)] sm:w-[80vw] md:w-[60vw] max-w-xl",
} as const;
