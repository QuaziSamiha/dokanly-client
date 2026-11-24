"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import {
  useCanUseWishlist,
  useToggleWishlist,
  useWishlistIds,
} from "@/modules/wishlist/hooks/useWishlist";
import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

interface IWishlistButton {
  productId: number;
  productName?: string;
  /** "icon": round button over a product image. "button": labelled outline button. */
  variant?: "icon" | "button";
  className?: string;
}

/**
 * Saves a product to (or removes it from) the customer's wishlist. Guests are
 * invited to log in; admins and employees never see it.
 */
export default function WishlistButton({
  productId,
  productName,
  variant = "icon",
  className,
}: IWishlistButton) {
  const { canUseWishlist, showWishlist } = useCanUseWishlist();
  const { wishlistIds } = useWishlistIds();
  const { mutate: toggle, isPending } = useToggleWishlist();
  const hasMounted = useHasMounted();

  //* ==== WHO IS SIGNED IN IS ONLY KNOWN IN THE BROWSER; AVOID A HYDRATION MISMATCH ====
  if (!hasMounted || !showWishlist) return null;

  const isSaved = wishlistIds.includes(productId);
  const label = isSaved ? "Remove from wishlist" : "Save to wishlist";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    //* ==== THE ICON SITS INSIDE A CARD LINK; DON'T OPEN THE PRODUCT ====
    e.preventDefault();
    e.stopPropagation();

    if (!canUseWishlist) {
      toast.info(
        <span>
          Please{" "}
          <Link href="/login" className="font-semibold underline">
            log in
          </Link>{" "}
          to save products to your wishlist.
        </span>,
        { duration: 3000 },
      );
      return;
    }
    if (isPending) return;
    toggle({ productId, save: !isSaved, productName });
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSaved}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border px-4 min-h-12 text-sm font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25",
          isSaved
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-neutralPrimary-300 bg-white text-neutralPrimary-700 hover:border-greenPrimary-300 hover:text-greenPrimary-600",
          className,
        )}
      >
        <Heart
          className={cn("w-5 h-5 transition-transform", isSaved && "fill-current scale-110")}
        />
        {isSaved ? "Saved" : "Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200 cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500",
        isSaved ? "text-rose-500" : "text-neutralPrimary-600 hover:text-rose-500",
        className,
      )}
    >
      <Heart className={cn("w-[18px] h-[18px]", isSaved && "fill-current")} />
    </button>
  );
}
