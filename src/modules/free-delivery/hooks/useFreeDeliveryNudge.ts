"use client";

import { useCallback } from "react";
import { useFreeDelivery } from "@/modules/free-delivery/hooks/useFreeDelivery";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import { cartTotals, formatTk } from "@/modules/cart/utils/cart-pricing.utils";

/**
 * Builds the "added to cart" toast text with a free delivery nudge, using the
 * same cart subtotal the cart page and checkout compare against the threshold.
 * Call it after the item is saved so the new line is counted.
 */
export function useFreeDeliveryNudge() {
  const { isFreeDeliveryAvailable, minimumOrderAmountForFreeDelivery } =
    useFreeDelivery();
  const threshold = isFreeDeliveryAvailable
    ? Number(minimumOrderAmountForFreeDelivery) || 0
    : 0;

  return useCallback(
    (message: string) => {
      if (threshold <= 0) return { text: message, duration: 500 };

      const remaining = threshold - cartTotals(localCart.get()).total;
      const nudge =
        remaining > 0
          ? `Add ${formatTk(remaining)} more for FREE delivery.`
          : "You've unlocked FREE delivery!";
      // Longer than the plain toast so the nudge can be read.
      return { text: `${message} ${nudge}`, duration: 2500 };
    },
    [threshold],
  );
}
