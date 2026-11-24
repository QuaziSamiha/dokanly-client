"use client";

import { useGet } from "@/hooks/api/useGet";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { useUser } from "@/modules/user/hooks/useUser";
import { IWishlistItem } from "@/modules/wishlist/types/wishlist.types";
import { IGenericErrorResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const WISHLIST_KEY = "wishlist";
export const WISHLIST_IDS_KEY = "wishlistProductIds";

/**
 * The wishlist belongs to the signed-in customer and lives on the server, so
 * it follows them across devices. Admins and employees have none.
 */
export function useCanUseWishlist() {
  const { userId, userInfo } = useUser();
  const role = (userInfo as { role?: string })?.role;
  return {
    isLoggedIn: !!userId,
    canUseWishlist: !!userId && (!role || role === "CUSTOMER"),
    /** Guests see the heart too; clicking it asks them to log in. */
    showWishlist: !userId || !role || role === "CUSTOMER",
  };
}

/** Ids of every saved product, so any product card can show a filled heart. */
export function useWishlistIds() {
  const { canUseWishlist } = useCanUseWishlist();
  const { data, isLoading } = useGet<number[]>(
    "/wishlist/product-ids",
    [WISHLIST_IDS_KEY],
    undefined,
    canUseWishlist,
    { staleTime: 60_000 },
  );
  const ids = Array.isArray(data) ? data : [];
  return { wishlistIds: ids, wishlistCount: ids.length, isLoading };
}

/** The full wishlist, for the wishlist page. */
export function useWishlist() {
  const { canUseWishlist } = useCanUseWishlist();
  const { data, isLoading, refetch } = useGet<IWishlistItem[]>(
    "/wishlist",
    [WISHLIST_KEY],
    undefined,
    canUseWishlist,
  );
  return {
    wishlistItems: Array.isArray(data) ? data : [],
    isWishlistLoading: isLoading,
    wishlistRefetch: refetch,
  };
}

/**
 * Saves or removes a product. The heart flips at once (optimistic update) and
 * flips back if the request fails.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    IGenericErrorResponse,
    { productId: number; save: boolean; productName?: string; silent?: boolean },
    { previous?: number[] }
  >({
    mutationFn: ({ productId, save }) =>
      save
        ? axiosInstance.post("/wishlist", { productId })
        : axiosInstance.delete(`/wishlist/${productId}`),
    onMutate: async ({ productId, save }) => {
      await queryClient.cancelQueries({ queryKey: [WISHLIST_IDS_KEY] });
      const previous = queryClient.getQueryData<number[]>([WISHLIST_IDS_KEY]);
      queryClient.setQueryData<number[]>([WISHLIST_IDS_KEY], (ids = []) =>
        save
          ? Array.from(new Set([...ids, productId]))
          : ids.filter((id) => id !== productId),
      );
      //* ==== THE WISHLIST PAGE DROPS A REMOVED CARD AT ONCE TOO ====
      if (!save) {
        queryClient.setQueryData<IWishlistItem[]>([WISHLIST_KEY], (items) =>
          items?.filter((item) => item.productId !== productId),
        );
      }
      return { previous };
    },
    onSuccess: (_data, { save, productName, silent }) => {
      if (silent) return;
      const name = productName ? `${productName} ` : "";
      if (save) toast.success(`${name}saved to your wishlist`, { duration: 1500 });
      else toast.info(`${name}removed from your wishlist`, { duration: 1500 });
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData([WISHLIST_IDS_KEY], context?.previous);
      toast.error(error?.message || "Could not update your wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_IDS_KEY] });
      queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] });
    },
  });
}
