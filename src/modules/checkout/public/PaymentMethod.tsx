"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Banknote, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import CheckoutSection from "./CheckoutSection";

export default function PaymentMethod() {
  const { watch, setValue } = useFormContext();
  const selected = watch("paymentMethod");

  return (
    <CheckoutSection
      id="checkout-payment"
      step={4}
      title="Payment"
      description={
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={14} className="text-greenPrimary-500" />
          Nothing is charged now.
        </span>
      }
    >
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Payment method">
        <button
          type="button"
          role="radio"
          aria-checked={selected === "CASH_ON_DELIVERY"}
          onClick={() => setValue("paymentMethod", "CASH_ON_DELIVERY", { shouldValidate: true })}
          className={`relative flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
            selected === "CASH_ON_DELIVERY"
              ? "border-greenPrimary-500 bg-greenPrimary-950"
              : "border-neutralPrimary-200 hover:border-neutralPrimary-300"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-500 text-white">
            <Banknote size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-neutralPrimary-800">Cash on Delivery</span>
            <span className="mt-0.5 block text-xs text-neutralPrimary-500">
              Pay in cash when the courier hands over your parcel.
            </span>
          </span>
          {selected === "CASH_ON_DELIVERY" && (
            <CheckCircle2 size={20} className="shrink-0 text-greenPrimary-500" />
          )}
        </button>

        <div
          role="radio"
          aria-checked={false}
          aria-disabled
          className="flex w-full items-start gap-3 rounded-xl border-2 border-dashed border-neutralPrimary-200 p-4 opacity-70"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutralPrimary-100 text-neutralPrimary-400">
            <CreditCard size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2 font-semibold text-neutralPrimary-600">
              Online payment
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Coming soon
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-neutralPrimary-400">
              Card, bKash and Nagad through SSLCommerz.
            </span>
          </span>
        </div>
      </div>
    </CheckoutSection>
  );
}
