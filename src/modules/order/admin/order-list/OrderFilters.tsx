"use client";

import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { CalendarDays, Search, SlidersHorizontal, X } from "lucide-react";
import { IOrderFilters } from "@/modules/order/types/order.types";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
  dhakaToday,
} from "@/modules/order/utils/order.utils";

type SelectKey = "paymentStatus" | "paymentMethod" | "deliveryMethod" | "customerType";

const SELECTS: {
  key: SelectKey;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "paymentStatus",
    label: "Payment",
    options: Object.entries(PAYMENT_STATUS_STYLES).map(([value, s]) => ({
      value,
      label: s.label,
    })),
  },
  {
    key: "paymentMethod",
    label: "Method",
    options: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    key: "deliveryMethod",
    label: "Zone",
    options: Object.entries(DELIVERY_METHOD_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    key: "customerType",
    label: "Customer",
    options: [
      { value: "REGISTERED", label: "Registered" },
      { value: "GUEST", label: "Guest" },
    ],
  },
];

const DATE_PRESETS = [
  { label: "Today", from: () => dhakaToday(), to: () => dhakaToday() },
  { label: "Last 7 days", from: () => dhakaToday(-6), to: () => dhakaToday() },
  { label: "Last 30 days", from: () => dhakaToday(-29), to: () => dhakaToday() },
];

const CONTROL =
  "h-10 rounded-lg border border-neutralPrimary-300 bg-white px-3 text-sm text-neutralPrimary-700 outline-none transition-all focus:border-greenPrimary-400 focus:ring-4 focus:ring-greenPrimary-500/10";

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

export default function OrderFilters({
  filters,
  search,
  onFiltersChange,
  onSearchChange,
  onReset,
}: {
  filters: IOrderFilters;
  search: string;
  onFiltersChange: (patch: Partial<IOrderFilters>) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}) {
  const [text, setText] = useState(search);
  const [showMore, setShowMore] = useState(false);

  // * Typing is debounced; an outside reset (e.g. "Clear all") empties the box.
  const debouncedSearch = useMemo(
    () => debounce((value: string) => onSearchChange(value.trim()), 400),
    [onSearchChange],
  );
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);
  useEffect(() => {
    if (search === "") setText("");
  }, [search]);

  const chips: { key: string; label: string; clear: () => void }[] = [];
  for (const select of SELECTS) {
    const value = filters[select.key];
    if (value) {
      chips.push({
        key: select.key,
        label: `${select.label}: ${select.options.find((o) => o.value === value)?.label ?? value}`,
        clear: () => onFiltersChange({ [select.key]: undefined }),
      });
    }
  }
  if (filters.dateFrom || filters.dateTo) {
    const range =
      filters.dateFrom && filters.dateFrom === filters.dateTo
        ? formatDay(filters.dateFrom)
        : `${filters.dateFrom ? formatDay(filters.dateFrom) : "…"} – ${filters.dateTo ? formatDay(filters.dateTo) : "today"}`;
    chips.push({
      key: "date",
      label: `Placed: ${range}`,
      clear: () => onFiltersChange({ dateFrom: undefined, dateTo: undefined }),
    });
  }
  if (search) {
    chips.push({
      key: "search",
      label: `“${search}”`,
      clear: () => {
        setText("");
        debouncedSearch.cancel();
        onSearchChange("");
      },
    });
  }

  const activeSelects = SELECTS.filter((s) => filters[s.key]).length;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-neutralPrimary-200 bg-white p-3 shadow-neutral02">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        {/* Search */}
        <label className="flex h-10 w-full items-center rounded-lg border border-neutralPrimary-300 bg-neutralPrimary-50 px-3 transition-all focus-within:border-greenPrimary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-greenPrimary-500/10 lg:max-w-sm">
          <Search size={16} className="shrink-0 text-neutralPrimary-400" />
          <span className="sr-only">Search orders</span>
          <input
            type="search"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder="Order no., phone, name or email…"
            className="w-full bg-transparent px-2.5 text-sm text-neutralPrimary-700 outline-none placeholder:text-neutralPrimary-400"
          />
        </label>

        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DATE_PRESETS.map((preset) => {
            const active =
              filters.dateFrom === preset.from() && filters.dateTo === preset.to();
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onFiltersChange(
                    active
                      ? { dateFrom: undefined, dateTo: undefined }
                      : { dateFrom: preset.from(), dateTo: preset.to() },
                  )
                }
                aria-pressed={active}
                className={`h-8 cursor-pointer rounded-full px-3 text-xs font-medium ring-1 ring-inset transition-colors ${
                  active
                    ? "bg-greenPrimary-600 text-white ring-greenPrimary-600"
                    : "bg-white text-neutralPrimary-600 ring-neutralPrimary-200 hover:bg-neutralPrimary-50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors lg:ml-auto ${
            showMore || activeSelects
              ? "border-greenPrimary-300 bg-greenPrimary-950 text-greenPrimary-700"
              : "border-neutralPrimary-300 text-neutralPrimary-600 hover:bg-neutralPrimary-50"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeSelects > 0 && (
            <span className="rounded-full bg-greenPrimary-600 px-1.5 text-[11px] font-semibold text-white">
              {activeSelects}
            </span>
          )}
        </button>
      </div>

      {/* More filters */}
      {showMore && (
        <div className="grid grid-cols-1 gap-2 border-t border-neutralPrimary-100 pt-3 animate-in fade-in slide-in-from-top-1 duration-200 sm:grid-cols-2 lg:grid-cols-6 motion-reduce:animate-none">
          {SELECTS.map((select) => (
            <label key={select.key} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
                {select.label}
              </span>
              <select
                value={filters[select.key] ?? ""}
                onChange={(e) =>
                  onFiltersChange({
                    [select.key]: e.target.value || undefined,
                  })
                }
                className={`${CONTROL} cursor-pointer`}
              >
                <option value="">All</option>
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
              <CalendarDays size={12} /> From
            </span>
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              max={filters.dateTo || dhakaToday()}
              onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined })}
              className={CONTROL}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
              <CalendarDays size={12} /> To
            </span>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              min={filters.dateFrom}
              max={dhakaToday()}
              onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined })}
              className={CONTROL}
            />
          </label>
        </div>
      )}

      {/* Active filters */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-950 py-1 pl-2.5 pr-1 text-xs font-medium text-greenPrimary-700 ring-1 ring-inset ring-greenPrimary-200"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-greenPrimary-200"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setText("");
                debouncedSearch.cancel();
                onReset();
              }}
              className="cursor-pointer px-2 text-xs font-semibold text-neutralPrimary-500 underline-offset-2 hover:text-destructive-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </section>
  );
}
