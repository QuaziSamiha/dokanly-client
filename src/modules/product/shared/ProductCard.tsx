"use client";

import { useUser } from "@/modules/user/hooks/useUser";
import { IProductCard } from "@/modules/product/types/product.types";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
// import * as pixel from "@/lib/analytics/fpixel"; // * LEGACY: direct Meta Pixel call — superseded by GTM dataLayer push below
import { trackEvent } from "@/lib/analytics/gtm.events";
import WishlistButton from "@/modules/wishlist/shared/WishlistButton";
import { useFreeDeliveryNudge } from "@/modules/free-delivery/hooks/useFreeDeliveryNudge";

export function ProductCard({ product }: IProductCard) {
  const { name, price, discountPrice, images, quantity, id } = product;
  // console.log(product);
  const isLowStockIssue = quantity === 0 ? true : false;
  const [added, setAdded] = useState(false);
  const { userInfo } = useUser();
  const freeDeliveryNudge = useFreeDeliveryNudge();
  const router = useRouter();
  const href = `/product-details/${product.slug}`;

  const canAddToCart = !userInfo?.role || userInfo.role === "CUSTOMER";

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canAddToCart) {
      toast.info("Admins and employees cannot add items to cart", {
        duration: 500,
      });
      return;
    }

    //* Sizes: with one size it is added directly; with several the customer
    //* picks one on the product page.
    const sizes = product.type === "VARIABLE" ? (product.variants ?? []) : [];
    if (sizes.length > 1) {
      router.push(href);
      return;
    }
    const size = sizes[0];

    localCart.addItem({
      id,
      variantId: size?.id,
      size: size?.size,
      name: size ? `${name} - ${size.size}` : name,
      price: (size?.price ?? price).toString(),
      discountPrice: (size ? size.discountPrice : discountPrice)
        ? String(size ? size.discountPrice : discountPrice)
        : undefined,
      image: images?.[0]?.url || "",
      quantity: 1,
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
        item_id: product.sku ? product.sku : `PROD_${product.id}`,
        item_name: product.name,
        quantity: 1,
        value: Number(product.price),
        currency: "BDT",
      },
    });

    const { text, duration } = freeDeliveryNudge(`${name} added to cart!`);
    toast.success(text, { duration });

    setAdded(true); //* show “Added!”
    setTimeout(() => setAdded(false), 2000); //* reset after 2 seconds
  };

  const imageUrl = images?.[0]?.url;
  const hasDiscount =
    !!discountPrice && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <div className="group flex flex-col gap-2 sm:gap-3 w-full h-full pb-2 rounded-t-lg rounded-b-xl transition-shadow duration-300 md:hover:shadow-lg">
      {/* //* ========== IMAGE + BUTTON ========= */}
      <div className="relative flex flex-col bg-neutralPrimary-100 rounded-t-md">
        {/* //* ==== OUTSIDE THE IMAGE LINK: A BUTTON INSIDE AN <a> IS INVALID HTML ==== */}
        <WishlistButton
          productId={id}
          productName={name}
          className="absolute top-2 right-2 z-10"
        />
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block w-full aspect-[378/338] overflow-hidden rounded-t-lg"
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={name}
              draggable={false}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={`object-contain transition-transform duration-500 ease-out md:group-hover:scale-105 ${
                isLowStockIssue ? "opacity-60" : ""
              }`}
            />
          )}
          {hasDiscount && !isLowStockIssue && (
            <span className="absolute top-2 left-2 rounded-full bg-warningPrimary-500 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
              -{discountPercent}%
            </span>
          )}
        </Link>
        {isLowStockIssue ? (
          <button
            type="button"
            disabled
            className="cursor-not-allowed w-full rounded min-h-10 sm:min-h-12 bg-destructive-200 font-semibold text-xs sm:text-sm lg:text-base text-destructive-500"
          >
            Out of Stock
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="cursor-pointer w-full rounded min-h-10 sm:min-h-12 bg-addToCart font-semibold text-xs sm:text-sm lg:text-base text-neutralPrimary-50 transition-[filter] hover:brightness-95 active:brightness-90"
          >
            {added ? "Added!" : "Add to Cart"}
          </button>
        )}
      </div>

      {/* //* ========== NAME + PRICE ========= */}
      <Link href={href} className="flex flex-col justify-between gap-1 sm:gap-2 flex-1 px-1.5 sm:px-2">
        <p className="text-sm leading-5 min-h-10 md:text-base md:leading-6 md:min-h-12 text-neutralPrimary-800 group-hover:text-greenPrimary-500 transition-colors font-semibold line-clamp-2 break-words">
          {name}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-greenPrimary-500">
            ৳ {hasDiscount ? discountPrice : price}
          </span>
          {hasDiscount && (
            <span className="text-gray-500 line-through text-xs sm:text-sm">
              ৳ {price}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART POST API IMPLEMENTED VERSION ======================
// "use client";

// import { usePost } from "@/hooks/api/usePost";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import { IProductCard } from "@/modules/product/types/product.types";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export function ProductCard({ product }: IProductCard) {
//   const { name, price, images, quantity, id } = product;
// console.log(product);
//   const isLowStockIssue = quantity === 0 ? true : false;

//   const { cartRefetch, userInfo, userId } = useCart();
//   const { mutate: addToCart, isPending } = usePost("/cart");
//   const router = useRouter();

//   const handleAddToCart = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!userInfo || !userId) {
//       router.push("/login");
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

//   return (
//     <Link href={`/product-details/${product.slug}`} className="cursor-pointer">
//       <div className="group flex flex-col gap-2 justify-between rounded-t-lg transition-all duration-300">
//         <div className="flex flex-col gap-0 bg-transparent">
//           {/* <Badge className="mt-2 bg-warningPrimary-500 text-white font-semibold text-xs z-10 mx-4 px-3 py-1">
//             {discount}
//           </Badge> */}
//           <div className="flex flex-col justify-center items-center gap-0">
//             <Image
//               src={images[0].url}
//               alt={name}
//               draggable={false}
//               width={378}
//               height={338}
//               className="w-[378px] h-[338px] object-contain rounded-t-lg"
//             />
//             {isLowStockIssue ? (
//               <div className="cursor-not-allowed w-[378px] bg-destructive-200 rounded-lg font-semibold text-base text-destructive-500 py-3.5">
//                 Out of Stock
//               </div>
//             ) : (
//               <button
//                 onClick={handleAddToCart}
//                 disabled={isPending}
//                 className="cursor-pointer disabled:cursor-not-allowed w-full rounded bg-greenPrimary-500 font-semibold text-base text-neutralPrimary-50 py-3.5"
//               >
//                 Add to Cart
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="flex flex-col justify-between gap-2 h-full">
//           <p className="text-base text-neutralPrimary-800 group-hover:text-greenPrimary-500 font-semibold">
//             {name}
//           </p>
//           <div className="flex gap-3">
//             <span className="font-semibold text-base text-greenPrimary-500">
//               ৳ {price}
//             </span>
//             {/* <span className="text-gray-500 line-through text-base">
//               ৳{originalPrice}
//             </span> */}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
