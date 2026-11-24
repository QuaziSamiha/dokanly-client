"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  AccountPageHeader,
  EmptyPanel,
  outlineButtonClass,
  primaryButtonClass,
} from "@/modules/account/customer/AccountUI";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import WishlistCard, { addWishlistItemToCart } from "./WishlistCard";

/** The customer's saved products, kept on their account. */
export default function WishList() {
  const router = useRouter();
  const { wishlistItems, isWishlistLoading } = useWishlist();
  const available = wishlistItems.filter((item) => item.product.isAvailable);

  //* ==== ITEMS STAY IN THE WISHLIST: "ADD ALL" IS A SHORTCUT, NOT A MOVE ====
  const handleAddAllToCart = () => {
    const added = available.filter(addWishlistItemToCart).length;
    if (!added) return;
    toast.success(`${added} product${added === 1 ? "" : "s"} added to your cart`, {
      duration: 1500,
    });
    router.push("/my-cart");
  };

  return (
    <section className="flex flex-col gap-6">
      <AccountPageHeader
        title="Wishlist"
        description={
          isWishlistLoading
            ? "Products you saved for later."
            : `${wishlistItems.length} saved product${wishlistItems.length === 1 ? "" : "s"}${
                wishlistItems.length > available.length
                  ? ` · ${wishlistItems.length - available.length} out of stock`
                  : ""
              }`
        }
        actions={
          available.length > 1 ? (
            <button type="button" onClick={handleAddAllToCart} className={outlineButtonClass}>
              <ShoppingCart className="h-4 w-4" />
              Add all to cart ({available.length})
            </button>
          ) : undefined
        }
      />

      {isWishlistLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <EmptyPanel
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here. Saved products stay on your account, on every device."
          action={
            <Link href="/product" className={primaryButtonClass}>
              Explore products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
          {wishlistItems.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
