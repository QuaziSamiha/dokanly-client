"use client";

import React from "react";
import Hero from "@/components/layout/hero/Hero";
import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import { useLocalCart } from "@/modules/cart/hooks/useLocalCart";
import { useFreeDelivery } from "@/modules/free-delivery/hooks/useFreeDelivery";
import { cartTotals } from "@/modules/cart/utils/cart-pricing.utils";
import OrderSummary from "./OrderSummary";
import CartItems from "./CartItems";
import EmptyCart from "./EmptyCart";
import CheckoutSteps from "./CheckoutSteps";
import FreeDeliveryProgress from "./FreeDeliveryProgress";
import MobileCheckoutBar from "./MobileCheckoutBar";

export default function MyCart() {
  const { cartItems, inventoryByProductId } = useLocalCart();
  const { isFreeDeliveryAvailable, minimumOrderAmountForFreeDelivery } =
    useFreeDelivery();

  const totals = cartTotals(cartItems);
  const threshold = isFreeDeliveryAvailable
    ? Number(minimumOrderAmountForFreeDelivery) || 0
    : 0;
  const hasItems = cartItems.length > 0;

  return (
    <section className="w-full">
      <Hero
        heroHeading="Shopping Cart"
        customBreadCrumb={<CustomBreadCrumb currentItem="Cart" />}
      />

      {/* Extra bottom space on small screens so the pinned checkout bar never covers content */}
      <main className={`container mx-auto px-4 pt-6 lg:pt-8 ${hasItems ? "pb-32 lg:pb-16" : "pb-12"}`}>
        {hasItems ? (
          <div className="flex flex-col gap-6">
            <CheckoutSteps current={0} />

            {threshold > 0 && (
              <FreeDeliveryProgress subtotal={totals.total} threshold={threshold} />
            )}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
              <CartItems cartItems={cartItems} inventoryByProductId={inventoryByProductId} />
              <aside className="lg:sticky lg:top-32">
                <OrderSummary totals={totals} freeDeliveryThreshold={threshold} />
              </aside>
            </div>

            <MobileCheckoutBar
              total={totals.total}
              savings={totals.savings}
              units={totals.units}
            />
          </div>
        ) : (
          <EmptyCart />
        )}
      </main>
    </section>
  );
}
