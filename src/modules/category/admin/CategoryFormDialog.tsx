"use client";

import { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface ICategoryFormDialog {
  title: string;
  description: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  /** Keeps the primary button disabled, e.g. while an edit has no changes. */
  submitDisabled?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Shell shared by the add and edit category dialogs: a header with the title
 * and a close button, the fields, and a footer that stays visible while the
 * fields scroll on short screens. Render inside CustomModal2 with
 * `hasOwnTitle`, since the title here is the dialog's accessible name.
 */
export default function CategoryFormDialog({
  title,
  description,
  submitLabel,
  pendingLabel,
  isPending,
  submitDisabled = false,
  onSubmit,
  onClose,
  children,
}: ICategoryFormDialog) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-col">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutralPrimary-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle className="text-lg font-semibold leading-tight text-neutralPrimary-800 sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutralPrimary-500">
            {description}
          </DialogDescription>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 -mt-1 shrink-0 cursor-pointer rounded-lg p-2 text-neutralPrimary-500 transition-colors hover:bg-neutralPrimary-100 hover:text-neutralPrimary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6">
        {children}
      </div>

      {/* Stacked full-width on phones (primary action on top), inline on sm+ */}
      <footer className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-neutralPrimary-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onClose}
          className="h-11 w-full cursor-pointer rounded-lg border border-neutralPrimary-300 bg-white px-5 text-sm font-semibold text-neutralPrimary-700 transition-colors hover:bg-neutralPrimary-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutralPrimary-300/40 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || submitDisabled}
          aria-busy={isPending}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-greenPrimary-500 sm:w-auto sm:min-w-36"
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isPending ? pendingLabel : submitLabel}
        </button>
      </footer>
    </form>
  );
}
