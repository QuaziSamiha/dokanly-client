"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";

/**
 * Phones and tablets: the summary card sits below every item, so the total
 * and the checkout button stay pinned to the bottom of the screen.
 */
export default function MobileCheckoutBar({
  total,
  savings,
  units,
}: {
  total: number;
  savings: number;
  units: number;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutralPrimary-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-neutralPrimary-500">
            Subtotal · {units} item{units === 1 ? "" : "s"}
          </p>
          <p className="text-lg font-extrabold tabular-nums text-neutralPrimary-800">
            {formatTk(total)}
          </p>
          {savings > 0 && (
            <p className="truncate text-[11px] font-semibold text-success-600">
              Saving {formatTk(savings)}
            </p>
          )}
        </div>
        <Link
          href="/check-out"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-greenPrimary-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600"
        >
          Checkout
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
