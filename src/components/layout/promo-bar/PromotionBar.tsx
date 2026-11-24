"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Copy, Sparkles, Truck } from "lucide-react";
import { useCurrentPromotion } from "@/modules/promotion/hooks/useCurrentPromotion";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeContent } from "@/modules/home/hooks/useHomeContent";
import { useFreeDelivery } from "@/modules/free-delivery/hooks/useFreeDelivery";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";

const COPIED_RESET_MS = 2000;
const DAY_MS = 24 * 60 * 60 * 1000;

//* SHARED SHELL: ONE HEIGHT FOR EVERY STATE SO THE FIXED NAVBAR BELOW NEVER
//* JUMPS WHEN THE PROMOTION FINISHES LOADING.
const BAR_CLASS =
  "relative w-full h-12 max-lg:hidden flex items-center justify-center overflow-hidden text-white text-sm bg-gradient-to-r from-greenPrimary-700 via-greenPrimary-500 to-greenPrimary-700";

function Dot() {
  return (
    <span aria-hidden className="size-1 shrink-0 rounded-full bg-white/40" />
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

const formatShortDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

//* "ENDS IN 3 DAYS" READS AT A GLANCE; INSIDE THE LAST DAY IT BECOMES A LIVE
//* HH:MM:SS COUNTDOWN — THE URGENCY CUE SHOPPERS RESPOND TO.
function useCountdown(target: Date | string | undefined) {
  const [now, setNow] = useState<number | null>(null);
  const targetMs = target ? new Date(target).getTime() : NaN;
  const remaining = now === null ? null : targetMs - now;
  const isFinalDay = remaining !== null && remaining > 0 && remaining < DAY_MS;

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    setNow(Date.now());
    const timer = setInterval(
      () => setNow(Date.now()),
      isFinalDay ? 1000 : 60_000,
    );
    return () => clearInterval(timer);
  }, [targetMs, isFinalDay]);

  if (remaining === null || Number.isNaN(remaining) || remaining <= 0)
    return null;
  if (!isFinalDay) {
    const days = Math.ceil(remaining / DAY_MS);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  const totalSec = Math.floor(remaining / 1000);
  return `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor((totalSec % 3600) / 60))}:${pad(totalSec % 60)}`;
}

export default function PromotionBar() {
  const [copied, setCopied] = useState(false);
  const { isPromotionLoading, currentPromotion, promotions } =
    useCurrentPromotion();
  const { isFreeDeliveryAvailable, minimumOrderAmountForFreeDelivery } =
    useFreeDelivery();
  const { promotionBar, isHomeContentLoading } = useHomeContent();

  const isUpcoming = Boolean(currentPromotion?.isUpcoming);
  const countdown = useCountdown(
    isUpcoming ? currentPromotion?.startDate : currentPromotion?.endDate,
  );

  const freeDeliveryThreshold = isFreeDeliveryAvailable
    ? Number(minimumOrderAmountForFreeDelivery) || 0
    : 0;
  const topTitle = promotionBar[0]?.title;

  const freeDeliveryOffer = freeDeliveryThreshold > 0 && (
    <Link
      href="/product"
      className="group flex shrink-0 items-center gap-2 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
        <Truck size={14} />
      </span>
      <span>
        <span className="font-semibold">Free delivery</span> over{" "}
        <span className="font-semibold">{formatTk(freeDeliveryThreshold)}</span>
      </span>
    </Link>
  );

  const handleCodeCopy = async () => {
    if (!currentPromotion?.couponCode) return;
    try {
      await navigator.clipboard.writeText(currentPromotion.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  // =========== Skeleton Loader ========
  if (isPromotionLoading || isHomeContentLoading) {
    return (
      <div className={BAR_CLASS} aria-busy="true">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-40 rounded-full bg-white/25" />
          <Dot />
          <Skeleton className="h-6 w-56 rounded-full bg-white/25" />
          <Dot />
          <Skeleton className="h-7 w-32 rounded-md bg-white/25" />
        </div>
      </div>
    );
  }

  // =========== No promotion: brand message + free delivery ========
  if (!currentPromotion) {
    return (
      <div className={BAR_CLASS} role="region" aria-label="Announcements">
        <div className="flex items-center gap-4 px-4">
          <p className="flex items-center gap-2 line-clamp-1">
            <Sparkles size={14} className="shrink-0 text-greenPrimary-100" />
            {topTitle || "Embrace the essence of nature with Natura Care"}
          </p>
          {freeDeliveryOffer && (
            <>
              <Dot />
              {freeDeliveryOffer}
            </>
          )}
        </div>
      </div>
    );
  }

  const { couponCode, startDate, endDate, discountValue, discountType } =
    currentPromotion;
  const discountLabel =
    discountType === "PERCENTAGE"
      ? `${discountValue}% OFF`
      : `${formatTk(discountValue)} OFF`;
  const fullDate = formatShortDate(isUpcoming ? startDate : endDate);

  return (
    <div className={BAR_CLASS} role="region" aria-label="Current offers">
      <div className="flex items-center justify-center gap-4 px-4 min-w-0">
        {/* ====== TOP TITLE (home content) — dropped below xl so the bar stays on one line ====== */}
        {topTitle && (
          <div className="flex min-w-0 items-center gap-4 max-xl:hidden">
            <p className="max-w-[28vw] truncate text-white/90" title={topTitle}>
              {topTitle}
            </p>
            <Dot />
          </div>
        )}

        {freeDeliveryOffer && (
          <>
            {freeDeliveryOffer}
            <Dot />
          </>
        )}

        {/* ====== DEAL: discount badge + countdown ====== */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="rounded-full bg-greenPrimary-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-greenPrimary-900 shadow-sm">
            {isUpcoming ? "Coming soon" : discountLabel}
          </span>
          <span
            className="flex items-center gap-1.5 text-white/90"
            title={`${isUpcoming ? "Starts" : "Ends"} ${fullDate}`}
          >
            <Clock size={14} className="shrink-0" />
            {isUpcoming ? "Starts" : "Ends"}{" "}
            {countdown ? (
              <>
                in{" "}
                <span className="font-semibold tabular-nums text-white">
                  {countdown}
                </span>
              </>
            ) : (
              <span className="font-semibold text-white">{fullDate}</span>
            )}
            {isUpcoming && (
              <span className="text-white/80">· {discountLabel}</span>
            )}
          </span>
        </div>

        <Dot />

        {/* ====== COUPON: the whole ticket is the copy target ====== */}
        <button
          type="button"
          onClick={handleCodeCopy}
          aria-label={`Copy coupon code ${couponCode}`}
          className={`group flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-dashed pl-3 pr-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            copied
              ? "border-greenPrimary-100 bg-greenPrimary-100 text-greenPrimary-900"
              : "border-white/60 bg-white/10 hover:border-white hover:bg-white/20"
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider opacity-80">
            Code
          </span>
          <span className="font-mono font-bold tracking-wider">
            {couponCode}
          </span>
          <span
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
              copied ? "" : "bg-white/15 group-hover:bg-white/25"
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? `Coupon code ${couponCode} copied to clipboard` : ""}
        </span>

        {promotions.length > 1 && (
          <>
            <Dot />
            <Link
              href="/all-promotions"
              className="group flex shrink-0 items-center gap-1 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              All deals
              <span className="rounded-full bg-white/15 px-1.5 text-xs">
                {promotions.length}
              </span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
