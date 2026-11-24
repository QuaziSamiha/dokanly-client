"use client";

import { IFreeDelivery } from "@/modules/free-delivery/types/free-delivery.types";
import { useGet } from "@/hooks/api/useGet";

export function useFreeDelivery() {
  const {
    data: freeDeliveryData,
    isLoading: isFreeDeliveryLoading,
    refetch: freeDeliveryRefetch,
  } = useGet<IFreeDelivery[]>(
    `/free-delivery-settings/active-free-delivery`,
    [`getActiveFreeDelivery`],
    undefined,
    undefined,
  );

  const freeDelivery = (freeDeliveryData || []).map((item) => ({
    id: item.id,
    minimumOrder: item.minOrderAmount,
    description: item.description,
  }));

  const isFreeDeliveryAvailable = (freeDeliveryData ?? []).length > 0;
  const minimumOrderAmountForFreeDelivery = isFreeDeliveryAvailable
    ? freeDeliveryData?.[0].minOrderAmount
    : undefined;

  // console.log(freeDelivery);

  return {
    freeDeliveryData,
    freeDeliveryRefetch,
    isFreeDeliveryLoading,
    freeDelivery,
    isFreeDeliveryAvailable,
    minimumOrderAmountForFreeDelivery,
  };
}
