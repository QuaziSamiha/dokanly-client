import SubmitButton from "@/components/form/SubmitButton";
import Link from "next/link";
import React from "react";
import { MdArrowBack, MdDeleteOutline } from "react-icons/md";

const CANCEL_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-lg border border-neutralPrimary-300 bg-white px-6 text-sm font-semibold text-neutralPrimary-700 transition-colors hover:bg-neutralPrimary-50 md:text-base";

const DELETE_BUTTON =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 md:text-base";

// Header of the add and edit product pages; Save is always in reach.
// The page must leave room for the phone action bar (see PHONE_ACTION_BAR_SPACE).
export const PHONE_ACTION_BAR_SPACE = "pb-24 sm:pb-0";

export default function ProductFormHeader({
  title,
  submitTitle,
  isPending,
  onDelete,
  isDeleting = false,
}: {
  title: string;
  submitTitle: string;
  isPending: boolean;
  // Edit page only: soft-deletes (archives) the product.
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  return (
    // Phones: the header scrolls away and the actions sit in a bar fixed to the
    // bottom of the screen (thumb reach; "← Products" doubles as Cancel).
    // sm and up: one header that sticks under the fixed navbar (h-20).
    <header className="-mt-6 flex flex-col gap-4 border-b border-neutralPrimary-200 bg-backgroundPrimary pb-4 pt-6 sm:sticky sm:top-20 sm:z-20 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-neutralPrimary-500 transition-colors hover:text-neutralPrimary-800"
        >
          <MdArrowBack className="text-base" />
          Products
        </Link>
        <h1
          className="truncate text-xl font-semibold text-neutralPrimary-700 sm:text-2xl"
          title={title}
        >
          {title}
        </h1>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-neutralPrimary-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:static sm:z-auto sm:w-auto sm:shrink-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isPending}
            aria-label="Delete product"
            className={DELETE_BUTTON}
          >
            <MdDeleteOutline className="text-lg" />
            {/* Icon only on phones to leave room for Save */}
            <span className="hidden sm:inline">
              {isDeleting ? "Deleting..." : "Delete"}
            </span>
          </button>
        )}
        <Link href="/products" className="hidden sm:block">
          <button type="button" className={CANCEL_BUTTON}>
            Cancel
          </button>
        </Link>
        <div className="min-w-0 flex-1 sm:flex-none">
          <SubmitButton
            isPending={isPending}
            submitTitle={isPending ? "Saving..." : submitTitle}
            buttonWidth="w-full sm:w-auto"
          />
        </div>
      </div>
    </header>
  );
}
