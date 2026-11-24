"use client";

import { useUser } from "@/modules/user/hooks/useUser";
import { IProduct, IProductVariant } from "@/modules/product/types/product.types";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";
import { useFreeDelivery } from "@/modules/free-delivery/hooks/useFreeDelivery";
import { useFreeDeliveryNudge } from "@/modules/free-delivery/hooks/useFreeDeliveryNudge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Minus, Plus, ShoppingCart, Truck, Zap } from "lucide-react";
// import * as pixel from "@/lib/analytics/fpixel"; // * LEGACY: direct Meta Pixel call — superseded by GTM dataLayer push below
import { trackEvent } from "@/lib/analytics/gtm.events";
import { productItemId, productPricing, productStock } from "./product-details.utils";
import WishlistButton from "@/modules/wishlist/shared/WishlistButton";
import { toPlainText } from "@/modules/product/utils/product-text.utils";

export default function DetailsWithAction({ product }: { product: IProduct }) {
  const { name, id, images, sku, tags } = product;
  const shortDescription = toPlainText(product.shortDescription);

  //* Products that come in sizes: each size has its own price and stock.
  //* Start on the first size in stock (the list is in the admin's order).
  const sizes = product.type === "VARIABLE" ? (product.variants ?? []) : [];
  const [sizeId, setSizeId] = useState<number | undefined>(
    () => (sizes.find((v) => v.quantity > 0) ?? sizes[0])?.id,
  );
  const selectedSize = sizes.find((v) => v.id === sizeId);
  const priced = selectedSize ?? product;

  const { price, unit, hasDiscount, savings, percentOff } = productPricing(priced);
  const { available, isOutOfStock, isLowStock } = productStock(priced);
  const categoryName = product.category?.name || product.categoryName;
  const lineName = selectedSize ? `${name} - ${selectedSize.size}` : name;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [ctaInView, setCtaInView] = useState(true);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUser();
  const router = useRouter();
  const { minimumOrderAmountForFreeDelivery } = useFreeDelivery();
  const freeDeliveryNudge = useFreeDeliveryNudge();

  const canAddToCart = !userInfo?.role || userInfo.role === "CUSTOMER";

  //* Show the sticky mobile bar only once the main buttons scroll out of view
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setCtaInView(entry.isIntersecting)
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const addToCart = (): boolean => {
    if (!canAddToCart) {
      toast.info("Admins and employees cannot add items to cart", {
        duration: 500,
      });
      return false;
    }

    localCart.addItem({
      id,
      variantId: selectedSize?.id,
      size: selectedSize?.size,
      name: lineName,
      price: price.toString(),
      discountPrice: priced.discountPrice ? priced.discountPrice.toString() : undefined,
      image: images?.find((image) => image.isPrimary)?.url || images?.[0]?.url || "",
      quantity: qty,
    });

    // * LEGACY: direct Meta Pixel call — kept for rollback safety, superseded by trackEvent() below
    // pixel.event("AddToCart", {
    //   content_ids: [product.sku ? product.sku : `PROD_${product.id}`],
    //   content_type: "product",
    //   content_name: product.name,
    //   value: Number(product.price),
    //   currency: "BDT",
    // });

    trackEvent({
      name: "add_to_cart",
      params: {
        item_id: productItemId(product),
        item_name: lineName,
        quantity: qty,
        value: price * qty,
        currency: "BDT",
      },
    });
    return true;
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!addToCart()) return;

    const { text, duration } = freeDeliveryNudge(`${lineName} added to cart!`);
    toast.success(text, { duration });

    setAdded(true); //* show “Added!”
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000); //* reset after 2 seconds
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (addToCart()) router.push("/check-out");
  };

  const chooseSize = (nextId: number) => {
    setSizeId(nextId);
    setQty(1); //* Each size has its own stock
  };

  const changeQty = (next: number) =>
    setQty(Math.min(Math.max(next, 1), Math.max(available, 1)));

  const addToCartLabel = added ? (
    <>
      <Check className="size-5" /> Added
    </>
  ) : (
    <>
      <ShoppingCart className="size-5" /> Add to Cart
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 sm:gap-5 lg:max-w-none">
      {/* //* ========== TITLE ========= */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {categoryName && (
          <Link
            href="/product"
            className="w-fit text-xs font-semibold tracking-wider text-greenPrimary-500 uppercase hover:text-greenPrimary-700"
          >
            {categoryName}
          </Link>
        )}
        <h1 className="text-lg leading-snug font-semibold [overflow-wrap:anywhere] text-neutralPrimary-800 min-[400px]:text-xl sm:text-2xl sm:leading-tight md:text-3xl xl:text-4xl">
          {name}
        </h1>
        {sku && (
          <p className="text-xs [overflow-wrap:anywhere] text-neutralPrimary-500">
            SKU: <span className="font-medium text-neutralPrimary-600">{sku}</span>
          </p>
        )}
      </div>

      {/* //* ========== PRICE + STOCK ========= */}
      <div className="flex flex-col gap-3 rounded-xl bg-neutralPrimary-50 p-3.5 ring-1 ring-neutralPrimary-100 sm:rounded-2xl sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-bold text-greenPrimary-500 tabular-nums sm:text-3xl xl:text-4xl">
            {formatTk(unit)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base text-neutralPrimary-400 line-through sm:text-lg tabular-nums">
                {formatTk(price)}
              </span>
              <span className="rounded-full bg-warningPrimary-100 px-2.5 py-0.5 text-xs font-semibold text-warningPrimary-700 sm:text-sm">
                Save {formatTk(savings)} ({percentOff}%)
              </span>
            </>
          )}
        </div>

        {sizes.length > 0 && (
          <SizePicker sizes={sizes} selectedId={sizeId} onChoose={chooseSize} />
        )}

        <StockBadge
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          available={available}
        />
      </div>

      {shortDescription && (
        <p className="text-sm leading-relaxed [overflow-wrap:anywhere] text-neutralPrimary-600 sm:text-base">
          {shortDescription}
        </p>
      )}

      {/* //* ========== COMBO CONTENTS ========= */}
      {product.type === "COMBO" && product.bundleItems?.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-neutralPrimary-800">
            What&apos;s in this combo
          </p>
          <ul className="flex flex-col gap-1.5">
            {product.bundleItems.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline gap-2 text-sm text-neutralPrimary-600"
              >
                <span className="font-semibold tabular-nums text-neutralPrimary-800">
                  {item.quantity}×
                </span>
                {item.productSlug ? (
                  <Link
                    href={`/product-details/${item.productSlug}`}
                    className="hover:text-greenPrimary-600 hover:underline"
                  >
                    {item.productName}
                    {item.size ? ` (${item.size})` : ""}
                  </Link>
                ) : (
                  <span>
                    {item.productName}
                    {item.size ? ` (${item.size})` : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* //* ========== ACTIONS ========= */}
      <div ref={ctaRef} className="flex flex-col gap-3">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-destructive-100 py-3.5 text-base font-semibold text-destructive-500"
          >
            Out of Stock
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutralPrimary-700">
                Quantity
              </span>
              <div className="flex h-11 items-center rounded-lg border border-neutralPrimary-300 bg-white">
                <button
                  type="button"
                  onClick={() => changeQty(qty - 1)}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-full w-11 cursor-pointer items-center justify-center rounded-l-lg text-neutralPrimary-700 transition hover:bg-neutralPrimary-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <span
                  className="w-10 text-center font-semibold text-neutralPrimary-800 tabular-nums"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(qty + 1)}
                  disabled={qty >= available}
                  aria-label="Increase quantity"
                  className="flex h-full w-11 cursor-pointer items-center justify-center rounded-r-lg text-neutralPrimary-700 transition hover:bg-neutralPrimary-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-addToCart px-3 text-sm sm:px-6 sm:text-base font-semibold text-white shadow-sm transition-[filter] hover:brightness-95 active:brightness-90"
              >
                {addToCartLabel}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-3 text-sm sm:px-6 sm:text-base font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600"
              >
                <Zap className="size-5" /> Buy Now
              </button>
            </div>
          </>
        )}
        {/* //* ==== ALSO OFFERED WHEN OUT OF STOCK: "SAVE FOR LATER" ==== */}
        <WishlistButton
          productId={id}
          productName={name}
          variant="button"
          className="w-full"
        />
      </div>

      {/* //* ========== DELIVERY INFO ========= */}
      {!!minimumOrderAmountForFreeDelivery && (
        <div className="flex items-center gap-3 rounded-xl border border-greenPrimary-200 bg-greenPrimary-950 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-greenPrimary-500 text-white">
            <Truck className="size-[18px]" />
          </span>
          <p className="text-sm text-neutralPrimary-700">
            <span className="font-semibold text-greenPrimary-700">Free delivery</span>{" "}
            on orders of {formatTk(Number(minimumOrderAmountForFreeDelivery))} or more.
          </p>
        </div>
      )}

      {tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutralPrimary-100 px-3 py-1 text-xs font-medium text-neutralPrimary-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* //* ========== STICKY MOBILE BAR ========= */}
      {!isOutOfStock && (
        <div
          aria-hidden={ctaInView}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutralPrimary-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 lg:hidden ${
            ctaInView ? "pointer-events-none translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutralPrimary-800">{lineName}</p>
              <p className="flex items-baseline gap-2">
                <span className="text-base font-bold text-greenPrimary-500 tabular-nums">
                  {formatTk(unit)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-neutralPrimary-400 line-through tabular-nums">
                    {formatTk(price)}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              tabIndex={ctaInView ? -1 : 0}
              className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-addToCart px-5 text-sm font-semibold text-white"
            >
              {addToCartLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SizePicker({
  sizes,
  selectedId,
  onChoose,
}: {
  sizes: IProductVariant[];
  selectedId?: number;
  onChoose: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-neutralPrimary-700">Size</p>
      <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const selected = size.id === selectedId;
          const soldOut = size.quantity <= 0;
          return (
            <button
              key={size.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChoose(size.id)}
              title={soldOut ? "Out of stock" : undefined}
              className={`min-h-10 cursor-pointer rounded-lg border bg-white px-4 text-sm font-medium transition-colors ${
                selected
                  ? "border-greenPrimary-500 text-greenPrimary-600 ring-1 ring-greenPrimary-500"
                  : "border-neutralPrimary-300 text-neutralPrimary-700 hover:border-neutralPrimary-400"
              } ${soldOut ? "line-through decoration-neutralPrimary-300 opacity-60" : ""}`}
            >
              {size.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StockBadge({
  isOutOfStock,
  isLowStock,
  available,
}: {
  isOutOfStock: boolean;
  isLowStock: boolean;
  available: number;
}) {
  const { dot, text, label } = isOutOfStock
    ? { dot: "bg-destructive-500", text: "text-destructive-600", label: "Out of stock" }
    : isLowStock
      ? {
          dot: "bg-warningPrimary-500",
          text: "text-warningPrimary-700",
          label: `Hurry, only ${available} left`,
        }
      : { dot: "bg-success-500", text: "text-success-700", label: "In stock" };

  return (
    <p className={`flex items-center gap-2 text-sm font-medium ${text}`}>
      <span className="relative flex size-2.5">
        {!isOutOfStock && (
          <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dot}`} />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${dot}`} />
      </span>
      {label}
    </p>
  );
}

// "use client";

// // import CommonButton from "@/components/primitives/button/CommonButton";
// // import QuantityCounter from "@/components/primitives/QuantityCounter";
// import { Separator } from "@/components/ui/separator";
// import { usePost } from "@/hooks/api/usePost";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import { IProduct } from "@/modules/product/types/product.types";
// import { useRouter } from "next/navigation";
// import React from "react";

// export default function DetailsWithAction({ product }: { product: IProduct }) {
//   // const [quantity, setQuantity] = useState<number>(1);
//   // const isLowStockIssue = product?.quantity === 0 ? true : false;
//   const { name, price, description, quantity, id } = product;
//   const isLowStockIssue = quantity === 0 ? true : false;
//   const { mutate: addToCart, isPending } = usePost("/cart");
//   const { cartRefetch, userInfo, userId } = useCart();
//   const router = useRouter();

//   const handleAddToCart = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!userInfo || !userId) {
//       router.push("/login"); // redirect to login page
//       return;
//     }

//     addToCart(
//       {
//         productId: id,
//         quantity: 1,
//       },
//       {
//         onSuccess: () => {
//           cartRefetch();
//         },
//         onError: (error) => {
//           console.error("Add to cart failed:", error);
//         },
//       }
//     );
//   };
//   // console.log(product);
//   return (
//     <section className="w-full lg:w-5/12">
//       <div className="flex flex-col gap-3">
//         <p className="text-neutralPrimary-800 max-lg:text-lg lg:text-4xl font-medium">
//           {name}
//         </p>
//         <div className="flex gap-3">
//           <span className="font-bold max-lg:text-base text-2xl text-greenPrimary-500">
//             ৳ {price}
//           </span>
//           {/* <span className="font-medium max-lg:text-base text-2xl text-neutralPrimary-400 line-through">
//             ৳ 150
//           </span> */}
//         </div>
//         <ul className="list-disc list-inside text-neutralPrimary-800 mb-4 space-y-2 pt-3">
//           <li>{description}</li>
//         </ul>
//         <Separator />
//         <section className="flex flex-col items-start gap-5 pt-5">
//           {/* <div className="flex max-md:flex-col md:flex-row max-md:items-start md:items-center justify-start gap-3.5">
//             <p className="font-semibold text-neutralPrimary-800 text-base">
//               Size:
//             </p>
//             <div className="flex items-center gap-3.5">
//               {sizes?.map((size, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setSelectedSize(size)}
//                   className={`max-md:text-sm text-base max-md:font-medium text-semibold  rounded-sm px-2 py-1 cursor-pointer ${
//                     selectedSize === size
//                       ? "border border-greenPrimary-300 text-greenPrimary-500"
//                       : "border border-neutralPrimary-400"
//                   }`}
//                 >
//                   {size}
//                 </div>
//               ))}
//             </div>
//           </div> */}
//           <div className="flex max-md:flex-col md:flex-row items-start gap-3">
//             {/* <QuantityCounter
//               minValue={1}
//               value={quantity}
//               valueChange={setQuantity}
//             /> */}
//             {isLowStockIssue ? (
//               <button className="cursor-not-allowed px-24 w-full bg-destructive-200 rounded font-semibold text-base text-destructive-500 py-3.5">
//                 Out of Stock
//               </button>
//             ) : (
//               <button
//                 onClick={handleAddToCart}
//                 disabled={isPending}
//                 className="px-24 cursor-pointer disabled:cursor-not-allowed w-full rounded bg-greenPrimary-500 font-semibold text-base text-neutralPrimary-50 py-3.5"
//               >
//                 Add to Cart
//               </button>
//             )}
//           </div>
//         </section>
//       </div>
//     </section>
//   );
// }
