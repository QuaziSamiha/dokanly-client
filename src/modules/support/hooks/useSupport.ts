"use client";

import { ISupport } from "@/modules/support/types/support.types";
import { useGet } from "@/hooks/api/useGet";

export function useSupport() {
  const {
    data: allSupport,
    isLoading: isSupportLoading,
    refetch: refetchSupport,
  } = useGet<ISupport[]>(`/support/all-support`, ["getAllSupport"]);
  // console.log(allSupport);
  const supports: ISupport[] = allSupport || [];

  const termCondition = supports.find((s) => s.type === "TERMS_CONDITION");
  const shippingDelivery = supports.find((s) => s.type === "SHIPPING_DELIVERY");
  const returnExchange = supports.find((s) => s.type === "RETURN_EXCHANGE");
  const privacySecurity = supports.find((s) => s.type === "PRIVACY_POLICY");

  return {
    supports,
    termCondition,
    shippingDelivery,
    returnExchange,
    privacySecurity,
    isSupportLoading,
    refetchSupport,
  };
}

// "use client";

// import { ISupport } from "@/modules/support/types/support.types";
// import { useGet } from "@/hooks/api/useGet";

// export function useSupport() {
//   const {
//     data: allSupport,
//     isLoading: isSupportLoading,
//     refetch: refetchSupport,
//   } = useGet<ISupport[]>(`/support/all-support`, ["getAllSupport"]);
//   const supports: ISupport[] = allSupport || [];

//   const termCondition = supports?.[3];
//   const shippingDelivery = supports?.[2];
//   const returnExchange = supports?.[1];
//   const privacySecurity = supports?.[0];

//   return {
//     supports,
//     termCondition,
//     shippingDelivery,
//     returnExchange,
//     privacySecurity,
//     isSupportLoading,
//     refetchSupport,
//   };
// }
