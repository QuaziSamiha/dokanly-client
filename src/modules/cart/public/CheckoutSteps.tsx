import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Cart", "Details & payment", "Order placed"];

/** Where the shopper is in the purchase: Cart → Details & payment → Order placed. */
export default function CheckoutSteps({ current = 0 }: { current?: number }) {
  return (
    <ol className="mx-auto flex w-full max-w-xl items-center" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step}
            className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}
          >
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done || active
                    ? "bg-greenPrimary-500 text-white"
                    : "bg-neutralPrimary-100 text-neutralPrimary-400"
                } ${active ? "ring-4 ring-greenPrimary-500/20" : ""}`}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={14} /> : index + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold sm:text-sm ${
                  active ? "text-greenPrimary-600" : "text-neutralPrimary-400"
                }`}
              >
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full sm:mb-0 sm:mx-3 ${
                  done ? "bg-greenPrimary-500" : "bg-neutralPrimary-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
