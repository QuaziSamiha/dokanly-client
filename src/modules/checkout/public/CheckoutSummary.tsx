"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ImageIcon, Lock, Pencil, ShieldCheck } from "lucide-react";
import { cartLineKey, ILocalCartItem } from "@/modules/cart/utils/local-cart.utils";
import { cartTotals, formatTk, linePricing } from "@/modules/cart/utils/cart-pricing.utils";
import Promotion, { IPromotionInfo } from "./Promotion";

function ItemRow({ item }: { item: ILocalCartItem }) {
  const [failed, setFailed] = useState(false);
  const line = linePricing(item);
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-neutralPrimary-200 bg-backgroundPeach p-1">
          {item.image && !failed ? (
            <Image
              src={item.image}
              alt={item.name}
              width={56}
              height={56}
              onError={() => setFailed(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageIcon size={20} className="text-neutralPrimary-300" />
          )}
        </div>
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutralPrimary-700 px-1 text-[11px] font-bold text-white">
          {line.quantity}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-neutralPrimary-800">{item.name}</p>
        <p className="text-xs text-neutralPrimary-500">
          {formatTk(line.unit)} × {line.quantity}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-neutralPrimary-800">
          {formatTk(line.lineTotal)}
        </p>
        {line.hasDiscount && (
          <p className="text-xs tabular-nums text-neutralPrimary-400 line-through">
            {formatTk(line.lineOriginal)}
          </p>
        )}
      </div>
    </li>
  );
}

export default function CheckoutSummary({
  items,
  totals,
  deliveryCharge,
  isFreeDelivery,
  zoneLabel,
  isDeliveryLoading,
  promotionInfo,
  setPromotionInfo,
  grandTotal,
  onPlaceOrder,
  isPending,
}: {
  items: ILocalCartItem[];
  totals: ReturnType<typeof cartTotals>;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  zoneLabel?: string;
  isDeliveryLoading: boolean;
  promotionInfo: IPromotionInfo;
  setPromotionInfo: React.Dispatch<React.SetStateAction<IPromotionInfo>>;
  grandTotal: number;
  onPlaceOrder: () => void;
  isPending: boolean;
}) {
  // * Long carts start folded on phones so the totals stay near the top.
  const [showItems, setShowItems] = useState(items.length <= 3);

  return (
    <section
      aria-labelledby="checkout-summary-title"
      className="w-full rounded-2xl border border-neutralPrimary-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="checkout-summary-title" className="text-lg font-bold text-neutralPrimary-800 sm:text-xl">
          Order summary
        </h2>
        <Link
          href="/my-cart"
          className="inline-flex items-center gap-1 text-sm font-medium text-greenPrimary-600 underline-offset-2 hover:underline"
        >
          <Pencil size={13} />
          Edit cart
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setShowItems((v) => !v)}
        aria-expanded={showItems}
        className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-lg bg-neutralPrimary-50 px-3 py-2 text-sm text-neutralPrimary-600 lg:hidden"
      >
        {showItems ? "Hide" : "Show"} {totals.units} item{totals.units === 1 ? "" : "s"}
        <ChevronDown size={16} className={`transition-transform ${showItems ? "rotate-180" : ""}`} />
      </button>
      <ul
        className={`max-h-80 divide-y divide-neutralPrimary-100 overflow-y-auto pr-1 scrollbar-brand lg:block ${
          showItems ? "block" : "hidden"
        }`}
      >
        {items.map((item) => (
          <ItemRow key={cartLineKey(item)} item={item} />
        ))}
      </ul>

      <div className="mt-3 border-t border-neutralPrimary-100 pt-4">
        <Promotion
          setPromotionInfo={setPromotionInfo}
          subTotal={totals.total}
          promotionAmount={promotionInfo.promotionAmount}
        />
      </div>

      <dl className="mt-4 flex flex-col gap-2.5 border-t border-neutralPrimary-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutralPrimary-500">Subtotal</dt>
          <dd className="tabular-nums text-neutralPrimary-700">{formatTk(totals.total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutralPrimary-500">
            Delivery{zoneLabel && <span className="text-neutralPrimary-400"> · {zoneLabel}</span>}
          </dt>
          <dd className="text-right tabular-nums">
            {isDeliveryLoading ? (
              <span className="inline-block h-4 w-12 animate-pulse rounded bg-neutralPrimary-100" />
            ) : isFreeDelivery ? (
              <span className="font-semibold text-success-600">
                FREE{" "}
                <span className="font-normal text-neutralPrimary-400 line-through">
                  {formatTk(deliveryCharge)}
                </span>
              </span>
            ) : (
              <span className="text-neutralPrimary-700">{formatTk(deliveryCharge)}</span>
            )}
          </dd>
        </div>
        {!!promotionInfo.promotionId && (
          <div className="flex justify-between">
            <dt className="text-neutralPrimary-500">Coupon discount</dt>
            <dd className="font-medium tabular-nums text-success-600">
              −{formatTk(promotionInfo.promotionAmount)}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-neutralPrimary-200 pt-4">
        <span className="text-base font-semibold text-neutralPrimary-800">Total</span>
        <span className="text-2xl font-extrabold tabular-nums text-neutralPrimary-800">
          {formatTk(grandTotal)}
        </span>
      </div>
      <p className="mt-0.5 text-right text-xs text-neutralPrimary-500">Pay in cash on delivery</p>

      {totals.savings + promotionInfo.promotionAmount > 0 && (
        <p className="mt-3 rounded-lg bg-success-100 px-3 py-2 text-center text-sm font-semibold text-success-600">
          🎉 You save {formatTk(totals.savings + promotionInfo.promotionAmount)} on this order
        </p>
      )}

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={isPending}
        className="mt-4 hidden w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/30 disabled:cursor-wait disabled:opacity-70 lg:flex"
      >
        <Lock size={16} />
        Place order · {formatTk(grandTotal)}
      </button>

      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs text-neutralPrimary-500">
        <ShieldCheck size={14} className="mt-px shrink-0 text-greenPrimary-500" />
        Your details are only used to deliver this order.
      </p>
    </section>
  );
}
