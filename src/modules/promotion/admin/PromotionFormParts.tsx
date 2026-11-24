"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import SubmitButton from "@/components/form/SubmitButton";

/** A titled group of fields; stacks to one column on phones. */
export function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutralPrimary-800">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-neutralPrimary-400">{description}</p>
          )}
        </div>
      </div>
      {/* Extra row gap leaves room for the absolutely placed field errors. */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

/** A small explanation under a field. */
export function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="-mt-5 text-xs text-neutralPrimary-400 md:col-span-2">
      {children}
    </p>
  );
}

/** How the offer reads to a customer, updated as the form changes. */
export function OfferPreview({
  code,
  offer,
  validity,
}: {
  code?: string;
  offer: string;
  validity?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-3 ring-1 ring-greenPrimary-100 sm:p-4">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-greenPrimary-600">
        <Sparkles size={12} />
        Customer preview
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className="w-fit max-w-full truncate rounded-lg border-2 border-dashed border-greenPrimary-400 bg-white px-3 py-1 font-mono text-base font-bold tracking-[0.15em] text-greenPrimary-700">
          {code || "YOURCODE"}
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-neutralPrimary-800">{offer}</p>
          {validity && (
            <p className="text-xs text-neutralPrimary-500">{validity}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Cancel + submit; stacked full-width on phones (primary on top). */
export function FormActions({
  onCancel,
  submitTitle,
  isPending,
  cancelLabel = "Cancel",
  hideSubmit = false,
}: {
  onCancel: () => void;
  submitTitle: string;
  isPending: boolean;
  cancelLabel?: string;
  hideSubmit?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-neutralPrimary-100 pt-4 sm:flex-row sm:items-end sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 w-full cursor-pointer rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 sm:w-auto md:text-base"
      >
        {cancelLabel}
      </button>
      {!hideSubmit && (
        <SubmitButton
          submitTitle={submitTitle}
          isPending={isPending}
          buttonWidth="w-full sm:w-fit"
        />
      )}
    </div>
  );
}
