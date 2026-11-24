"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, Banknote, ShieldCheck, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cartTotals, formatTk } from "@/modules/cart/utils/cart-pricing.utils";

type Totals = ReturnType<typeof cartTotals>;

const TRUST = [
  { icon: <Banknote size={16} />, text: "Cash on delivery available" },
  { icon: <Truck size={16} />, text: "Delivery across Bangladesh" },
  { icon: <ShieldCheck size={16} />, text: "100% genuine Natura products" },
];

export default function OrderSummary({
  totals,
  freeDeliveryThreshold,
}: {
  totals: Totals;
  freeDeliveryThreshold?: number;
}) {
  const freeDelivery =
    !!freeDeliveryThreshold && totals.total >= freeDeliveryThreshold;

  return (
    <section
      aria-labelledby="order-summary-title"
      className="w-full rounded-2xl border border-neutralPrimary-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 id="order-summary-title" className="text-xl font-bold text-neutralPrimary-800">
        Order Summary
      </h2>

      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-neutralPrimary-500">
            Items ({totals.units})
          </dt>
          <dd className="tabular-nums text-neutralPrimary-700">{formatTk(totals.original)}</dd>
        </div>
        {totals.savings > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-neutralPrimary-500">Product discounts</dt>
            <dd className="tabular-nums font-medium text-success-600">
              −{formatTk(totals.savings)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-neutralPrimary-500">Delivery</dt>
          <dd
            className={`text-right ${freeDelivery ? "font-semibold text-success-600" : "text-neutralPrimary-500"}`}
          >
            {freeDelivery ? "FREE" : "Calculated at checkout"}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-neutralPrimary-800">Subtotal</span>
        <span className="text-2xl font-extrabold tabular-nums text-neutralPrimary-800">
          {formatTk(totals.total)}
        </span>
      </div>
      {!freeDelivery && (
        <p className="mt-1 text-right text-xs text-neutralPrimary-400">
          + delivery charge for your area
        </p>
      )}

      {totals.savings > 0 && (
        <p className="mt-3 rounded-lg bg-success-100 px-3 py-2 text-center text-sm font-semibold text-success-600">
          🎉 You&apos;re saving {formatTk(totals.savings)} on this order
        </p>
      )}

      <Link
        href="/check-out"
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/30"
      >
        Proceed to Checkout
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutralPrimary-500">
        <BadgePercent size={14} />
        Have a coupon? Apply it at checkout.
      </p>

      <ul className="mt-5 flex flex-col gap-2.5 border-t border-neutralPrimary-100 pt-4">
        {TRUST.map((item) => (
          <li key={item.text} className="flex items-center gap-2.5 text-sm text-neutralPrimary-600">
            <span className="text-greenPrimary-500">{item.icon}</span>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART API IMPLEMENTED VERSION ======================
// "use client";
// import LinkableButton from "@/components/primitives/button/LinkableButton";
// import OrderSummarySkeleton from "@/modules/cart/public/OrderSummarySkeleton";
// import { Separator } from "@/components/ui/separator";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import React, { useMemo } from "react";

// export default function OrderSummary() {
//   const { cartData, isCartLoading } = useCart();
//   const discount = 0;

//   const subTotal = useMemo(() => {
//     if (!cartData?.items) return 0;

//     return cartData?.items.reduce((acc, item) => {
//       const quantity = Number(item.quantity);
//       const price = Number(item.product?.price);
//       // console.log(price * quantity);
//       return acc + quantity * price;
//     }, 0);
//   }, [cartData]);

//   // console.log(subTotal);
//   return (
//     <section className="max-lg:w-full lg:basis-1/3">
//       <div className="lg:border lg:border-neutralPrimary-300 lg:rounded-2xl w-full lg:p-8">
//         {isCartLoading ? (
//           <OrderSummarySkeleton />
//         ) : (
//           <div className="text-neutralPrimary-800 flex flex-col gap-8">
//             <p className="font-bold max-md:text-base max-lg:xl text-2xl">
//               Order Summary
//             </p>
//             <div className="flex flex-col gap-4 lg:gap-6">
//               <div className="flex justify-between items-center">
//                 <p>Subtotal</p>
//                 <p>৳ {subTotal}</p>
//               </div>
//               <div className="flex justify-between items-center">
//                 <p>Discount</p>
//                 <p>৳ {discount}</p>
//               </div>
//               <Separator />
//               <div className="flex justify-between items-center max-lg:text-base text-xl font-semibold">
//                 <p>Grand Total</p>
//                 <p>৳ {subTotal - discount}</p>
//               </div>
//               <LinkableButton label="Checkout Now" link="check-out" />
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
