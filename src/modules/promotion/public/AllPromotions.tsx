"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  ClipboardPaste,
  Copy,
  Hourglass,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentPromotion } from "@/modules/promotion/hooks/useCurrentPromotion";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import {
  daysBetween,
  formatDate,
  formatTk,
  isPercentage,
  isUsedUp,
  scheduleHint,
  startOfDay,
} from "@/modules/promotion/utils/promotion.utils";
import { Skeleton } from "@/components/ui/skeleton";

const isUpcoming = (p: IPromotion) =>
  p.isUpcoming ?? startOfDay(p.startDate) > startOfDay(new Date());

const byEndDate = (a: IPromotion, b: IPromotion) =>
  new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

/** The rules a customer has to meet, in plain words. */
const conditionsOf = (p: IPromotion) => {
  const rules: string[] = [];
  if (p.minPurchase) rules.push(`Min. order ${formatTk(p.minPurchase)}`);
  if (p.maxPurchase) rules.push(`Orders up to ${formatTk(p.maxPurchase)}`);
  if (isPercentage(p) && p.maxDiscountAmount) {
    rules.push(`Save up to ${formatTk(p.maxDiscountAmount)}`);
  }
  if (!rules.length) rules.push("No minimum order");
  return rules;
};

export default function AllPromotions() {
  const { promotions, isPromotionLoading } = useCurrentPromotion();
  const [copied, setCopied] = useState<string | null>(null);

  const { available, upcoming } = useMemo(() => {
    const list = promotions.filter((p) => !isUsedUp(p));
    return {
      available: list.filter((p) => !isUpcoming(p)).sort(byEndDate),
      upcoming: list
        .filter(isUpcoming)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
    };
  }, [promotions]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`${code} copied. Paste it at checkout.`, {
        duration: 2000,
      });
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 2500);
    } catch (error) {
      toast.error("Couldn't copy. Please type the code at checkout.");
      console.error("Failed to copy: ", error);
    }
  };

  return (
    <main className="container mx-auto flex flex-col gap-10 px-4 py-10 md:px-6 lg:py-16">
      {/* ======= HEADER ======= */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutralPrimary-800 md:text-3xl">
          Coupons &amp; Offers
        </h1>
        <p className="max-w-2xl text-neutralPrimary-500">
          Copy a code below and paste it in the coupon box at checkout. One
          coupon per order.
        </p>
      </header>

      <HowItWorks />

      {isPromotionLoading ? (
        <CouponGrid>
          {[1, 2, 3].map((i) => (
            <CouponSkeleton key={i} />
          ))}
        </CouponGrid>
      ) : !available.length && !upcoming.length ? (
        <EmptyState />
      ) : (
        <>
          {available.length > 0 && (
            <CouponSection title="Available now" count={available.length}>
              {available.map((p) => (
                <CouponCard
                  key={p.id}
                  promotion={p}
                  isCopied={copied === p.couponCode}
                  onCopy={handleCopy}
                />
              ))}
            </CouponSection>
          )}
          {upcoming.length > 0 && (
            <CouponSection title="Coming soon" count={upcoming.length}>
              {upcoming.map((p) => (
                <CouponCard
                  key={p.id}
                  promotion={p}
                  isCopied={copied === p.couponCode}
                  onCopy={handleCopy}
                  upcoming
                />
              ))}
            </CouponSection>
          )}
        </>
      )}
    </main>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Copy, title: "Copy a code", text: "Pick an offer you qualify for" },
    {
      icon: ShoppingBag,
      title: "Fill your cart",
      text: "Meet the minimum order, if any",
    },
    {
      icon: ClipboardPaste,
      title: "Paste at checkout",
      text: "Tap “Have a coupon code?” and apply",
    },
  ];
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map(({ icon: Icon, title, text }, i) => (
        <li
          key={title}
          className="flex items-center gap-3 rounded-xl bg-greenPrimary-950 p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-greenPrimary-600">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutralPrimary-800">
              {i + 1}. {title}
            </p>
            <p className="text-xs text-neutralPrimary-500">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CouponSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-neutralPrimary-800">
        {title}
        <span className="rounded-full bg-neutralPrimary-100 px-2 py-0.5 text-xs font-semibold text-neutralPrimary-600">
          {count}
        </span>
      </h2>
      <CouponGrid>{children}</CouponGrid>
    </section>
  );
}

function CouponGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

interface CouponCardProps {
  promotion: IPromotion;
  isCopied: boolean;
  onCopy: (code: string) => void;
  upcoming?: boolean;
}

function CouponCard({ promotion: p, isCopied, onCopy, upcoming }: CouponCardProps) {
  const daysLeft = daysBetween(new Date(), p.endDate);
  const endingSoon = !upcoming && daysLeft <= 3;
  const remaining = p.usageLimit ? Math.max(0, p.usageLimit - p.usedCount) : null;
  const fewLeft =
    remaining !== null && !!p.usageLimit && remaining <= Math.max(5, p.usageLimit * 0.2);

  return (
    <article
      className={`flex overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        upcoming ? "border-neutralPrimary-300 border-dashed" : "border-neutralPrimary-300"
      }`}
    >
      {/* ======= DISCOUNT STUB ======= */}
      <div
        className={`relative flex w-28 shrink-0 flex-col items-center justify-center gap-0.5 px-2 text-center sm:w-32 ${
          upcoming
            ? "bg-neutralPrimary-100 text-neutralPrimary-600"
            : "bg-greenPrimary-500 text-white"
        }`}
      >
        {isPercentage(p) ? (
          <span className="text-4xl font-bold leading-none">
            {Number(p.discountValue)}%
          </span>
        ) : (
          <>
            <span className="text-sm font-semibold leading-none">Tk</span>
            <span className="text-4xl font-bold leading-none">
              {Number(p.discountValue).toLocaleString("en-US")}
            </span>
          </>
        )}
        <span className="text-sm font-semibold uppercase tracking-widest">Off</span>
        {/* ticket notches */}
        <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full border border-neutralPrimary-300 bg-white" />
        <span className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full border border-neutralPrimary-300 bg-white" />
      </div>

      {/* ======= DETAILS ======= */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 border-l-2 border-dashed border-neutralPrimary-300 p-4">
        <div className="flex flex-col gap-1">
          {p.title && (
            <h3 className="truncate font-semibold text-neutralPrimary-800" title={p.title}>
              {p.title}
            </h3>
          )}
          {p.description && (
            <p className="line-clamp-2 text-sm text-neutralPrimary-500">{p.description}</p>
          )}
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {conditionsOf(p).map((rule) => (
              <li
                key={rule}
                className="rounded-full bg-neutralPrimary-100 px-2.5 py-0.5 text-xs font-medium text-neutralPrimary-700"
              >
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* code + copy */}
        <div className="mt-auto flex items-stretch gap-2">
          <span className="flex min-w-0 flex-1 items-center justify-center truncate rounded-lg border border-dashed border-greenPrimary-400 bg-greenPrimary-950 px-3 py-2 font-mono text-base font-bold tracking-wider text-greenPrimary-700">
            {p.couponCode}
          </span>
          <button
            type="button"
            onClick={() => onCopy(p.couponCode)}
            disabled={upcoming}
            aria-label={`Copy coupon code ${p.couponCode}`}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-neutralPrimary-200 disabled:text-neutralPrimary-500 ${
              isCopied
                ? "bg-success-600 text-white"
                : "bg-neutralPrimary-800 text-white hover:bg-neutralPrimary-700"
            }`}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* validity + stock */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          {upcoming ? (
            <span className="inline-flex items-center gap-1 font-semibold text-warningPrimary-600">
              <CalendarClock size={14} />
              Starts {formatDate(p.startDate)} · {scheduleHint(p).toLowerCase()}
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 ${
                endingSoon ? "font-semibold text-destructive-600" : "text-neutralPrimary-500"
              }`}
            >
              <Hourglass size={14} />
              {endingSoon ? scheduleHint(p) : `Valid till ${formatDate(p.endDate)}`}
            </span>
          )}
          {remaining !== null && !upcoming && (
            <span
              className={
                fewLeft ? "font-semibold text-destructive-600" : "text-neutralPrimary-500"
              }
            >
              {fewLeft ? `Only ${remaining} left` : `${remaining} left`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CouponSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-neutralPrimary-300">
      <Skeleton className="h-44 w-28 rounded-none sm:w-32" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2 rounded-full" />
        <Skeleton className="mt-auto h-10 w-full rounded-lg" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutralPrimary-300 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600">
        <TicketPercent size={26} />
      </span>
      <p className="text-lg font-semibold text-neutralPrimary-800">No coupons right now</p>
      <p className="max-w-sm text-sm text-neutralPrimary-500">
        New offers show up here first. Check back soon, or keep shopping in the
        meantime.
      </p>
      <Link
        href="/product"
        className="mt-2 rounded-lg bg-greenPrimary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-greenPrimary-600"
      >
        Browse products
      </Link>
    </div>
  );
}
