"use client";

import React from "react";
import Link from "next/link";
import { PartyPopper, Truck } from "lucide-react";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";

/**
 * "Add ৳X more for free delivery" with a progress bar. Uses the same subtotal
 * checkout compares against the active free delivery setting.
 */
export default function FreeDeliveryProgress({
  subtotal,
  threshold,
  compact = false,
}: {
  subtotal: number;
  threshold: number;
  compact?: boolean;
}) {
  if (!threshold || threshold <= 0) return null;

  const remaining = Math.max(threshold - subtotal, 0);
  const unlocked = remaining === 0;
  const percent = Math.min(Math.round((subtotal / threshold) * 100), 100);

  return (
    <div
      className={`w-full rounded-xl border transition-colors duration-500 ${
        unlocked
          ? "border-greenPrimary-200 bg-greenPrimary-950"
          : "border-amber-200 bg-amber-50"
      } ${compact ? "p-3" : "p-4 sm:p-5"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            unlocked ? "bg-greenPrimary-500 text-white" : "bg-amber-100 text-amber-700"
          }`}
        >
          {unlocked ? <PartyPopper size={18} /> : <Truck size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold sm:text-base ${
              unlocked ? "text-greenPrimary-700" : "text-neutralPrimary-800"
            }`}
          >
            {unlocked ? (
              "You've unlocked FREE delivery!"
            ) : (
              <>
                Add <span className="text-amber-700">{formatTk(remaining)}</span> more
                for <span className="text-greenPrimary-600">FREE delivery</span>
              </>
            )}
          </p>
          {!compact && (
            <p className="mt-0.5 text-xs text-neutralPrimary-500 sm:text-sm">
              {unlocked
                ? "Your delivery charge will be ৳0 at checkout."
                : `Free delivery on orders of ${formatTk(threshold)} or more.`}
              {!unlocked && (
                <>
                  {" "}
                  <Link
                    href="/product"
                    className="font-semibold text-greenPrimary-600 underline-offset-2 hover:underline"
                  >
                    Shop more
                  </Link>
                </>
              )}
            </p>
          )}
          <div
            className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-inset ring-black/5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Progress towards free delivery"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                unlocked
                  ? "bg-greenPrimary-500"
                  : "bg-gradient-to-r from-amber-400 to-greenPrimary-500"
              }`}
              style={{ width: `${Math.max(percent, 4)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
