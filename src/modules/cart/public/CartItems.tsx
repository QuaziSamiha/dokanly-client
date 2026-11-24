"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import CartCard from "./CartCard";
import {
  cartLineKey,
  ILocalCartItem,
  isSameLine,
  localCart,
} from "@/modules/cart/utils/local-cart.utils";
import { linePricing } from "@/modules/cart/utils/cart-pricing.utils";
import { trackEvent } from "@/lib/analytics/gtm.events";
import { useConfirm } from "@/hooks/useConfirm";

const trackRemove = (item: ILocalCartItem) => {
  const line = linePricing(item);
  trackEvent({
    name: "remove_from_cart",
    params: {
      item_id: `PROD_${item.id}`,
      item_name: item.name,
      quantity: line.quantity,
      value: line.lineTotal,
      currency: "BDT",
    },
  });
};

/** Puts removed items back where they were. */
const restore = (removed: { item: ILocalCartItem; index: number }[]) => {
  const cart: ILocalCartItem[] = localCart.get();
  for (const { item, index } of [...removed].sort((a, b) => a.index - b.index)) {
    if (!cart.some((c) => isSameLine(c, item))) cart.splice(index, 0, item);
  }
  localCart.set(cart);
};

export default function CartItems({
  cartItems,
  inventoryByProductId,
}: {
  cartItems: ILocalCartItem[];
  // Current stock of each line, by cartLineKey.
  inventoryByProductId: Record<string, number>;
}) {
  const units = cartItems.reduce((sum, item) => sum + linePricing(item).quantity, 0);

  const handleRemove = (item: ILocalCartItem) => {
    const index = cartItems.findIndex((c) => isSameLine(c, item));
    trackRemove(item);
    localCart.removeItem(item.id, item.variantId);
    toast(`Removed "${item.name}"`, {
      duration: 5000,
      action: { label: "Undo", onClick: () => restore([{ item, index }]) },
    });
  };

  const { confirm } = useConfirm();

  const handleClear = async () => {
    const confirmed = await confirm({
      title: "Remove all items from your cart?",
      description: "You can undo this right after.",
      confirmLabel: "Clear cart",
      variant: "danger",
    });
    if (!confirmed) return;
    const removed = cartItems.map((item, index) => ({ item, index }));
    cartItems.forEach(trackRemove);
    localCart.set([]);
    toast("Your cart was cleared", {
      duration: 6000,
      action: { label: "Undo", onClick: () => restore(removed) },
    });
  };

  return (
    <section className="w-full min-w-0 rounded-2xl border border-neutralPrimary-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-neutralPrimary-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutralPrimary-800 sm:text-2xl">My Cart</h2>
          <p className="mt-0.5 text-sm text-neutralPrimary-500">
            {cartItems.length} product{cartItems.length === 1 ? "" : "s"} · {units} item
            {units === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-neutralPrimary-500 transition-colors hover:bg-destructive-100 hover:text-destructive-500"
        >
          Clear cart
        </button>
      </div>

      <ul className="divide-y divide-neutralPrimary-100">
        {cartItems.map((item) => (
          <CartCard
            key={cartLineKey(item)}
            item={item}
            inventoryQuantity={inventoryByProductId[cartLineKey(item)]}
            onRemove={handleRemove}
          />
        ))}
      </ul>

      <div className="border-t border-neutralPrimary-100 pt-4">
        <Link
          href="/product"
          className="inline-flex items-center gap-2 text-sm font-semibold text-greenPrimary-600 underline-offset-2 hover:underline"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>
      </div>
    </section>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART API IMPLEMENTED VERSION ======================
// "use client";

// import React from "react";
// import CartCard from "./CartCard";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function CartItems() {
//   const { totalCartItems, cartData, isCartLoading } = useCart();
//   console.log(cartData);
//   return (
//     <>
//       {Number(totalCartItems) > 0 ? (
//         <section className="max-lg:w-full lg:basis-2/3">
//           <div className="lg:border lg:border-neutralPrimary-300 lg:rounded-2xl w-full lg:p-8">
//             <div className="flex flex-col gap-4 md:gap-3 lg:gap-8 text-neutralPrimary-800">
//               <div className="flex flex-col gap-4">
//                 <p className="font-semibold text-2xl">My Cart</p>
//                 <p className="text-neutralPrimary-600">
//                   {isCartLoading ? (
//                     <span className="pr-1.5">
//                       <Skeleton className="w-4 h-4" />
//                     </span>
//                   ) : (
//                     <span className="pr-1.5">{Number(totalCartItems)}</span>
//                   )}
//                   items
//                 </p>
//               </div>
//               <section className="lg:border lg:border-neutralPrimary-300 lg:rounded-2xl w-full">
//                 {cartData?.items?.map((cartItem, index) => {
//                   const price = Number(cartItem.product.price);
//                   console.log(cartItem?.imageUrl)
//                   return (
//                     <CartCard
//                       key={index}
//                       index={index}
//                       itemId={cartItem.id}
//                       totalItems={cartItem.quantity}
//                       name={cartItem.product.name}
//                       imageUrl={cartItem.imageUrl ?? ""}
//                       pricePerItem={price}
//                     />
//                   );
//                 })}
//               </section>
//             </div>
//           </div>
//         </section>
//       ) : (
//         <div>No Item Added</div>
//       )}
//     </>
//   );
// }
