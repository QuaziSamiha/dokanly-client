"use client";

import { useGet } from "@/hooks/api/useGet";
import { getUserInfo } from "@/modules/auth/services/auth.service";
import { IAddress } from "@/modules/address/types/address.types";

export const USER_ADDRESS_KEY = "getUserAddress";

/** The signed-in user's saved addresses: default first, then newest first. */
export function useUserAddress() {
  const userInfo =
    (getUserInfo() as {
      sub?: number;
      email?: string;
      role?: number;
    }) || {};

  const { sub: userId } = userInfo;
  const shouldFetchUserAddress = !!userId;

  const {
    data: userAddressData,
    isLoading: isUserAddressLoading,
    refetch: userAddressRefetch,
  } = useGet<IAddress[]>(
    `/address/user/all-addresses`,
    [USER_ADDRESS_KEY],
    undefined,
    shouldFetchUserAddress
  );
  const customerAddresses = Array.isArray(userAddressData) ? userAddressData : [];
  return {
    customerAddresses,
    defaultAddress: customerAddresses.find((a) => a.isDefault) ?? customerAddresses[0],
    userAddressData,
    isUserAddressLoading,
    userAddressRefetch,
    userInfo,
    userId,
  };
}
