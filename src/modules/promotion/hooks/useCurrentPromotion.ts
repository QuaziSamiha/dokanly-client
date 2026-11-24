import { IPromotion } from "@/modules/promotion/types/promotion.types";
import { useGet } from "@/hooks/api/useGet";
import { useMemo } from "react";

export function useCurrentPromotion() {
  const {
    data: promotionData,
    isLoading: isPromotionLoading,
    refetch: promotionRefetch,
  } = useGet<IPromotion[]>(`/promotions/active-current-promotions`, [
    `getCurrentPromotion`,
  ]);

  // console.log(promotionData);

  const currentPromotion = useMemo(
    () => promotionData?.[0] ?? null,
    [promotionData]
  );

  const promotions = Array.isArray(promotionData) ? promotionData : [];
  return {
    promotionData,
    promotions,
    isPromotionLoading,
    promotionRefetch,
    currentPromotion,
  };
}
