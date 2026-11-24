"use client";

import React, { useRef } from "react";
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ConfirmModalVariant, IConfirmModal } from "@/types";

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  { Icon: typeof Trash2; iconBox: string; confirm: string }
> = {
  danger: {
    Icon: Trash2,
    iconBox: "bg-destructive-100 text-destructive-600 ring-destructive-50",
    confirm:
      "bg-destructive-600 hover:bg-destructive-700 focus-visible:ring-destructive-500/25",
  },
  warning: {
    Icon: AlertTriangle,
    iconBox: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-50",
    confirm:
      "bg-warningPrimary-600 hover:bg-warningPrimary-700 focus-visible:ring-warningPrimary-500/25",
  },
  info: {
    Icon: Info,
    iconBox: "bg-blueSecondary-100 text-blueSecondary-600 ring-blueSecondary-50",
    confirm:
      "bg-greenPrimary-500 hover:bg-greenPrimary-600 focus-visible:ring-greenPrimary-500/25",
  },
};

/**
 * Reusable confirmation dialog, a styled replacement for window.confirm.
 *
 * The caller owns `open` and closes it after the action succeeds, so the
 * modal can stay up with a spinner while the request runs:
 *
 *   deleteThing(endpoint, { onSuccess: () => setTarget(null) })
 */
export default function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isPending = false,
}: IConfirmModal) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { Icon, iconBox, confirm } = VARIANT_STYLES[variant];

  // Esc, outside click and Cancel are ignored while the action is running.
  const handleOpenChange = (next: boolean) => {
    if (!isPending) onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        role="alertdialog"
        className="w-[calc(100vw-2rem)] max-w-md gap-0 rounded-2xl border-0 bg-white p-0 shadow-xl"
        // Focus Cancel first, so Enter never runs a destructive action by accident.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-start sm:text-left">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-8",
              iconBox
            )}
          >
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <DialogTitle className="text-lg font-semibold leading-snug text-neutralPrimary-800">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm leading-relaxed text-neutralPrimary-500">
                {description}
              </DialogDescription>
            )}
            {children && <div className="pt-1 text-left">{children}</div>}
          </div>
        </div>

        {/* Stacked full-width on phones (primary action on top), inline on sm+ */}
        <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-neutralPrimary-100 bg-neutralPrimary-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="h-11 w-full sm:w-auto rounded-lg border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutralPrimary-300/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
            className={cn(
              "inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70",
              confirm
            )}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
