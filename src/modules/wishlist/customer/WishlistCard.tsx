"use client";

import { cn } from "@/lib/utils";
import { AccountCard } from "@/modules/account/customer/AccountUI";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import { formatBDT } from "@/modules/order/utils/order.utils";
import { useToggleWishlist } from "@/modules/wishlist/hooks/useWishlist";
import { IWishlistItem } from "@/modules/wishlist/types/wishlist.types";
import { trackEvent } from "@/lib/analytics/gtm.events";
import { ImageOff, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

/**
 * Adds a saved product to the cart (one unit). Returns false when it can't be
 * bought, or comes in sizes (the size is chosen on the product page).
 */
export const addWishlistItemToCart = (item: IWishlistItem) => {
  const { product } = item;
  if (!product.isAvailable || product.hasSizes) return false;
  localCart.addItem({
    id: product.id,
    name: product.name,
    price: String(product.price),
    discountPrice: product.discountPrice ? String(product.discountPrice) : undefined,
    image: product.imageUrl ?? "",
    quantity: 1,
  });
  trackEvent({
    name: "add_to_cart",
    params: {
      item_id: product.sku ? product.sku : `PROD_${product.id}`,
      item_name: product.name,
      quantity: 1,
      value: Number(product.discountPrice ?? product.price),
      currency: "BDT",
    },
  });
  return true;
};

export default function WishlistCard({ item }: { item: IWishlistItem }) {
  const { product } = item;
  const { mutate: toggle, isPending } = useToggleWishlist();
  const href = `/product-details/${product.slug}`;
  const hasDiscount = product.discountPrice !== null;
  const percentOff = hasDiscount
    ? Math.round(((product.price - (product.discountPrice as number)) / product.price) * 100)
    : 0;

  const remove = (silent = false) =>
    toggle({ productId: product.id, save: false, productName: product.name, silent });

  const handleMoveToCart = () => {
    if (!addWishlistItemToCart(item)) return;
    toast.success(`${product.name} moved to your cart`, { duration: 1500 });
    remove(true);
  };

  return (
    <AccountCard as="article" className={cn("group flex flex-col overflow-hidden", isPending && "opacity-60")}>
      <div className="relative aspect-square bg-neutralPrimary-100">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={cn(
                "object-contain p-3 transition-transform duration-500 group-hover:scale-105",
                !product.isAvailable && "opacity-50 grayscale",
              )}
            />
          ) : (
            <ImageOff className="absolute inset-0 m-auto h-8 w-8 text-neutralPrimary-300" />
          )}
        </Link>
        {hasDiscount && product.isAvailable && (
          <span className="absolute left-2 top-2 rounded-full bg-warningPrimary-500 px-2 py-0.5 text-xs font-semibold text-white">
            -{percentOff}%
          </span>
        )}
        <button
          type="button"
          onClick={() => remove()}
          disabled={isPending}
          aria-label={`Remove ${product.name} from wishlist`}
          title="Remove"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutralPrimary-600 shadow-sm ring-1 ring-black/5 transition-colors hover:text-destructive-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link
          href={href}
          className="text-sm font-semibold leading-5 text-neutralPrimary-800 hover:text-greenPrimary-600 line-clamp-2 min-h-10"
        >
          {product.name}
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-semibold text-greenPrimary-500">
            {formatBDT(product.discountPrice ?? product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutralPrimary-400 line-through">
              {formatBDT(product.price)}
            </span>
          )}
        </div>

        <p
          className={cn(
            "text-xs font-medium",
            !product.isAvailable
              ? "text-destructive-600"
              : product.stockStatus === "LOW_STOCK"
                ? "text-warningPrimary-600"
                : "text-emerald-600",
          )}
        >
          {!product.isAvailable
            ? "Out of stock"
            : product.stockStatus === "LOW_STOCK"
              ? `Only ${product.quantity} left`
              : "In stock"}
        </p>

        {product.hasSizes && product.isAvailable ? (
          <Link
            href={href}
            className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-addToCart text-sm font-semibold text-white transition-[filter] hover:brightness-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Choose size
          </Link>
        ) : (
        <button
          type="button"
          onClick={handleMoveToCart}
          disabled={!product.isAvailable || isPending}
          className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-addToCart text-sm font-semibold text-white transition-[filter] hover:brightness-95 cursor-pointer disabled:cursor-not-allowed disabled:bg-neutralPrimary-200 disabled:text-neutralPrimary-500"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.isAvailable ? "Move to cart" : "Unavailable"}
        </button>
        )}
      </div>
    </AccountCard>
  );
}
