"use client";

import React from "react";
import { Check } from "lucide-react";

export interface IStatusOption {
  value: string;
  label: string;
  hint?: string;
  dot: string;
  disabled?: boolean;
  disabledReason?: string;
}

/** A row of selectable status chips; works as a radio group. */
export default function StatusPicker({
  label,
  value,
  original,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  original?: string;
  options: IStatusOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutralPrimary-700">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              title={option.disabled ? option.disabledReason : option.hint}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? "border-greenPrimary-500 bg-greenPrimary-950 text-greenPrimary-700 ring-2 ring-greenPrimary-500/20"
                  : "border-neutralPrimary-200 bg-white text-neutralPrimary-600 hover:border-neutralPrimary-300"
              }`}
            >
              {active ? <Check size={14} /> : <span className={`h-2 w-2 rounded-full ${option.dot}`} />}
              {option.label}
              {option.value === original && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
                  current
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
