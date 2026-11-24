"use client";

import React from "react";

export type SegmentedOption<V> = {
  value: V | undefined;
  label: string;
  /** Optional count shown after the label. */
  count?: number;
  /** Optional colour dot before the label (a Tailwind bg-* class). */
  dot?: string;
  title?: string;
};

/**
 * A labelled group of toggle buttons for table toolbars ("STATUS  All | Active
 * | Inactive"). The option whose value is undefined means "no filter".
 */
export default function SegmentedFilter<V extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentedOption<V>[];
  value: V | undefined;
  onChange: (value: V | undefined) => void;
}) {
  return (
    // * On narrow screens the label wraps above the buttons, and the buttons
    // * scroll sideways instead of overflowing the card.
    <div
      role="group"
      aria-label={label}
      className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
        {label}
      </span>
      <div className="flex max-w-full overflow-x-auto rounded-lg border border-neutralPrimary-300 bg-neutralPrimary-50 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              title={option.title}
              onClick={() => onChange(option.value)}
              className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-sm sm:px-3 font-medium transition-colors ${
                selected
                  ? "bg-greenPrimary-600 text-white shadow-sm"
                  : "text-neutralPrimary-600 hover:bg-white hover:text-neutralPrimary-800"
              }`}
            >
              {option.dot && !selected && (
                <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
              )}
              {option.label}
              {option.count !== undefined && (
                <span
                  className={`text-xs tabular-nums ${
                    selected ? "text-white/80" : "text-neutralPrimary-400"
                  }`}
                >
                  {option.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
