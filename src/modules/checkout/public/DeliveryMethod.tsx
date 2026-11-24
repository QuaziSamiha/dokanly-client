"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import { useDeliveryPricing } from "@/modules/delivery-pricing/hooks/useDeliveryPricing";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";
import CheckoutSection from "./CheckoutSection";

const ZONE_LABELS: Record<string, string> = {
  INSIDE_DHAKA: "Inside Dhaka",
  OUTSIDE_DHAKA: "Outside Dhaka",
};

/**
 * The zone is picked automatically from the division (CheckOut sets
 * `deliveryMethod`), so the options are shown, not chosen.
 */
export default function DeliveryMethod({ isFreeDelivery }: { isFreeDelivery: boolean }) {
  const { watch } = useFormContext();
  const selected = watch("deliveryMethod");
  const { deliveryPricingOptions, isDeliveryPricingLoading } = useDeliveryPricing();

  return (
    <CheckoutSection
      id="checkout-delivery"
      step={3}
      title="Delivery"
      description="Set automatically from your division. Delivered by Steadfast Courier."
    >
      {isDeliveryPricingLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery zone">
          {deliveryPricingOptions.map((option) => {
            const active = option.value === selected;
            const charge = Number(option.deliveryCharge);
            return (
              <div
                key={option.value}
                role="radio"
                aria-checked={active}
                aria-disabled
                className={`relative flex items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                  active
                    ? "border-greenPrimary-500 bg-greenPrimary-950"
                    : "border-neutralPrimary-200 bg-white opacity-60"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-greenPrimary-500 text-white" : "bg-neutralPrimary-100 text-neutralPrimary-400"
                  }`}
                >
                  <Truck size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutralPrimary-800">
                    {ZONE_LABELS[option.value] ?? option.label}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutralPrimary-500">
                    <Clock size={12} />
                    Within {option.estimatedDays} days
                  </p>
                </div>
                <div className="text-right">
                  {active && isFreeDelivery ? (
                    <>
                      <p className="text-sm font-bold text-success-600">FREE</p>
                      <p className="text-xs text-neutralPrimary-400 line-through">
                        {formatTk(charge)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold tabular-nums text-neutralPrimary-800">
                      {formatTk(charge)}
                    </p>
                  )}
                </div>
                {active && (
                  <CheckCircle2
                    size={18}
                    className="absolute -right-2 -top-2 rounded-full bg-white text-greenPrimary-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </CheckoutSection>
  );
}
