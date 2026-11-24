"use client";

import { IDeliveryPricing } from "@/modules/delivery-pricing/types/delivery-pricing.types";
import { useGet } from "@/hooks/api/useGet";
import { IDeliveryMethodRadioOption } from "@/types";
import { useMemo } from "react";

export function useDeliveryPricing() {
  const { data: deliveryPricingData, isLoading: isDeliveryPricingLoading } =
    useGet<IDeliveryPricing[]>(`/delivery-pricing/active-delivery-pricing`, [
      `getAllActiveDeliveryPricing`,
    ]);

  // console.log(deliveryPricing);

  const deliveryPricingOptions = useMemo<IDeliveryMethodRadioOption[]>(() => {
    if (!Array.isArray(deliveryPricingData)) return [];

    return deliveryPricingData.map((item) => ({
      label: item.region,
      value: item.deliveryMethod,
      deliveryCharge: item.baseCharge,
      estimatedDays: item.estimatedDays,
    }));
  }, [deliveryPricingData]);

//   console.log(deliveryPricingOptions);
  return {
    deliveryPricingData,
    deliveryPricingOptions,
    isDeliveryPricingLoading,
  };
}
