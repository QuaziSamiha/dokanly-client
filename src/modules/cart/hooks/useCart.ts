import { ICart } from "@/modules/cart/types/cart.types";
import { useGet } from "@/hooks/api/useGet";
import { getUserInfo } from "@/modules/auth/services/auth.service";

export function useCart() {
  const userInfo =
    (getUserInfo() as {
      sub?: number;
      email?: string;
      role?: number;
    }) || {};

  const { sub: userId } = userInfo;

  const shouldFetchCartData = !!userId;
  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: cartRefetch,
  } = useGet<ICart>(
    `/cart`,
    [`getAllCartData`],
    undefined,
    shouldFetchCartData
  );

  // console.log(cartData);

  const totalCartItems = cartData?.items?.length;
  return {
    cartData,
    isCartLoading,
    cartRefetch,
    totalCartItems,
    userInfo,
    userId,
  };
}
