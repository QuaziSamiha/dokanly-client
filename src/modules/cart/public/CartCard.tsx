"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ILocalCartItem,
  isSameLine,
  localCart,
} from "@/modules/cart/utils/local-cart.utils";
import { formatTk, linePricing } from "@/modules/cart/utils/cart-pricing.utils";

/** "Only N left" shows at or below this stock. */
const LOW_STOCK = 5;

interface ICartCard {
  item: ILocalCartItem;
  /** Current stock from the server; undefined until prices are loaded. */
  inventoryQuantity?: number;
  onRemove: (item: ILocalCartItem) => void;
}

export default function CartCard({ item, inventoryQuantity, onRemove }: ICartCard) {
  const [imageFailed, setImageFailed] = useState(false);
  const line = linePricing(item);
  const quantity = line.quantity;
  const atMax = inventoryQuantity !== undefined && quantity >= inventoryQuantity;
  const lowStock =
    inventoryQuantity !== undefined && inventoryQuantity > 0 && inventoryQuantity <= LOW_STOCK;

  const setQuantity = (next: number) => {
    if (next < 1) return;
    if (inventoryQuantity !== undefined && next > inventoryQuantity) {
      toast.error(`Only ${inventoryQuantity} of "${item.name}" in stock.`);
      return;
    }
    localCart.set(
      localCart
        .get()
        .map((cartItem: ILocalCartItem) =>
          isSameLine(cartItem, item) ? { ...cartItem, quantity: next } : cartItem,
        ),
    );
  };

  const stepButton =
    "flex h-10 w-10 cursor-pointer items-center justify-center text-neutralPrimary-700 transition-colors hover:bg-neutralPrimary-100 disabled:cursor-not-allowed disabled:text-neutralPrimary-300 disabled:hover:bg-transparent";

  return (
    <li className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 sm:py-5 animate-in fade-in duration-300 motion-reduce:animate-none">
      {/* Image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-backgroundPeach p-2 sm:p-3">
        {item.image && !imageFailed ? (
          <Image
            src={item.image}
            alt={item.name ?? "Product image"}
            width={112}
            height={112}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageIcon size={28} className="text-neutralPrimary-300" />
        )}
        {line.percentOff > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-destructive-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            −{line.percentOff}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutralPrimary-800 sm:text-base">
            {item.name}
          </p>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name} from cart`}
            title="Remove"
            className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-lg p-2 text-neutralPrimary-400 transition-colors hover:bg-destructive-100 hover:text-destructive-500"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Unit price */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-bold tabular-nums text-greenPrimary-600 sm:text-base">
            {formatTk(line.unit)}
          </span>
          {line.hasDiscount && (
            <span className="text-xs tabular-nums text-neutralPrimary-400 line-through sm:text-sm">
              {formatTk(line.price)}
            </span>
          )}
          <span className="text-xs text-neutralPrimary-400">each</span>
        </div>

        {lowStock && (
          <p className="text-xs font-medium text-amber-700">
            Only {inventoryQuantity} left in stock
          </p>
        )}

        {/* Quantity + line total */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
          <div
            className="inline-flex items-center overflow-hidden rounded-lg border border-neutralPrimary-300 bg-white"
            role="group"
            aria-label={`Quantity of ${item.name}`}
          >
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className={stepButton}
            >
              <Minus size={16} />
            </button>
            <span
              className="w-9 text-center text-sm font-semibold tabular-nums text-neutralPrimary-800"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={atMax}
              aria-label="Increase quantity"
              title={atMax ? "No more in stock" : undefined}
              className={stepButton}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-base font-bold tabular-nums text-neutralPrimary-800 sm:text-lg">
              {formatTk(line.lineTotal)}
            </p>
            {line.lineSavings > 0 && (
              <p className="text-xs font-medium text-success-600">
                You save {formatTk(line.lineSavings)}
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART API IMPLEMENTED VERSION ======================
// "use client";

// import { useDelete } from "@/hooks/api/useDelete";
// import { usePatch } from "@/hooks/api/usePatch";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import Image from "next/image";
// import React, { useState } from "react";

// interface ICardData {
//   itemId: number;
//   totalItems: number;
//   index: number;
//   name: string;
//   imageUrl: string;
//   pricePerItem: string;
// }

// export default function CartCard({
//   itemId,
//   totalItems,
//   index,
//   name,
//   imageUrl,
//   pricePerItem,
// }: ICardData) {
//   const [totalItem, setTotalItem] = useState<number>(totalItems);
//   const { mutate: deleteItem, isPending: isDeletePending } = useDelete(
//     `/cart/items/${itemId}`,
//     "getAllCartData"
//   );

//   const { mutate: updateCartItem, isPending: isPatchPending } = usePatch(
//     () => {
//       cartRefetch();
//     },
//     (error) => {
//       console.error("Failed to update cart item:", error);
//     }
//   );
//   // console.log(totalItems)
//   const { cartRefetch } = useCart();

//   const handleUpdateCartItem = (newQuantity: number) => {
//     setTotalItem(newQuantity);
//     // Call backend API
//     updateCartItem({
//       endpoint: `/cart/items/${itemId}`,
//       data: { quantity: newQuantity },
//     });
//   };

//   return (
//     <div
//       className={`w-full ${
//         index === totalItems - 1
//           ? "border-0"
//           : "border-b border-neutralPrimary-300"
//       }`}
//       key={index}
//     >
//       <div className="flex items-stretch justify-between my-6 lg:m-6">
//         {/* ========== LEFT SIDE (DESCRIPTION PART) =========== */}
//         <div className="flex items-start gap-6 lg:gap-8">
//           {/* ============== IMAGE PART ============= */}
//           <div className="bg-backgroundPeach p-6 rounded-xl">
//             <Image
//               src={imageUrl ?? "/placeholder.png"}
//               alt={name ?? "Product image"}
//               width={160}
//               height={160}
//               className=" "
//             />
//           </div>
//           {/* =================== NAME | QUANTITY | BUTTONS ================= */}
//           <div className="flex flex-col gap-2 lg:gap-4 h-full">
//             {/* ============ PRODUCT NAME =========== */}
//             <p className="max-md:text-xs text-lg font-semibold text-greenPrimary-500">
//               {name}
//             </p>
//             <p className="text-neutralPrimary-800 max-lg:text-sm lg:text-base font-semibold lg:hidden">
//               ৳ {pricePerItem}
//             </p>
//             {/* ============ QUANTITY ============ */}
//             {/* <div className="flex items-center gap-2 pb-2 font-semibold max-lg:text-sm lg:text-base">
//               <p className="text-neutralPrimary-600">Quantity</p>{" "}
//               <p className="text-neutralPrimary-800">{quantity}</p>
//             </div> */}
//             {/* ============== BUTTONS  */}
//             <div className="flex gap-6 items-center mt-auto">
//               <div className="flex items-center gap-6 border border-neutralPrimary-300 rounded text-neutralPrimary-800 font-semibold p-2">
//                 <button
//                   type="button"
//                   onClick={() => handleUpdateCartItem(totalItem + 1)}
//                   // onClick={() => setTotalItem((prev) => prev + 1)}
//                   disabled={isPatchPending}
//                   className="mx-2 cursor-pointer text-xl"
//                 >
//                   +
//                 </button>
//                 <div className="max-md:text-sm text-base">{totalItem}</div>
//                 <button
//                   type="button"
//                   // onClick={() =>
//                   //   setTotalItem((prev) => (prev > 1 ? prev - 1 : prev))
//                   // }
//                   onClick={() =>
//                     totalItem > 1 && handleUpdateCartItem(totalItem - 1)
//                   }
//                   disabled={isPatchPending}
//                   className={`mx-2 cursor-pointer text-xl disabled:cursor-not-allowed ${
//                     totalItem === 1 && "cursor-not-allowed"
//                   }`}
//                 >
//                   -
//                 </button>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => deleteItem()}
//                 disabled={isDeletePending}
//                 className="disabled:cursor-not-allowed max-lg:text-sm lg:text-base font-semibold text-destructive-500 cursor-pointer"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//         {/* ========= RIGHT SIDE (PRICE PART) =========== */}
//         <div className="max-lg:hidden">
//           <p className="text-neutralPrimary-800 font-semibold">
//             ৳ {pricePerItem}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
