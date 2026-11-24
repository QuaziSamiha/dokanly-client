"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AccountCard,
  AccountCardTitle,
  EmptyPanel,
  primaryButtonClass,
} from "@/modules/account/customer/AccountUI";
import { useUserAddress } from "@/modules/address/hooks/useUserAddress";
import { orderDeliveryRegions } from "@/modules/checkout/constants/checkout.constants";
import OrderCard from "@/modules/order/customer/OrderCard";
import {
  useUserOrders,
  useUserOrderSummary,
} from "@/modules/order/hooks/useUserOrders";
import { formatBDT } from "@/modules/order/utils/order.utils";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import {
  ArrowRight,
  Circle,
  CircleCheck,
  Heart,
  ImageOff,
  LucideIcon,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function StatTile({
  icon: Icon,
  label,
  value,
  href,
  hint,
  isLoading,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  href: string;
  hint?: string;
  isLoading?: boolean;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-neutralPrimary-300/70 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accent)}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 text-neutralPrimary-300 transition-transform group-hover:translate-x-0.5 group-hover:text-greenPrimary-500" />
      </div>
      <div className="flex flex-col gap-0.5">
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-neutralPrimary-800 tabular-nums">{value}</p>
        )}
        <p className="text-sm font-medium text-neutralPrimary-600">{label}</p>
        {hint && <p className="text-xs text-neutralPrimary-400">{hint}</p>}
      </div>
    </Link>
  );
}

/** The account home: what's on its way, recent orders, and quick links. */
export default function AccountOverview() {
  const { currentUserData: user, isCurrentUserLoading } = useCurrentUser();
  const { orderSummary, isOrderSummaryLoading } = useUserOrderSummary();
  const { customerOrders, isUserOrdersLoading } = useUserOrders({ page: 1, limit: 3 });
  const { wishlistItems, isWishlistLoading } = useWishlist();
  const { defaultAddress, customerAddresses, isUserAddressLoading } = useUserAddress();

  const firstName = user?.firstName || user?.name?.split(" ")[0];

  //* ==== EACH UNFINISHED STEP LINKS TO THE PAGE THAT FINISHES IT ====
  const setupSteps = [
    { label: "Add a profile photo", done: !!user?.profileImageUrl, href: "/my-account/account-information" },
    { label: "Add your phone number", done: !!user?.phone, href: "/my-account/account-information" },
    { label: "Verify your email", done: !!user?.emailVerified },
    { label: "Save a delivery address", done: customerAddresses.length > 0, href: "/my-account/addresses" },
  ];
  const setupDone = setupSteps.filter((s) => s.done).length;
  const isSetupComplete = setupDone === setupSteps.length;

  return (
    <section className="flex flex-col gap-6">
      {/* ================= WELCOME ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-greenPrimary-700 via-greenPrimary-500 to-greenPrimary-300 p-6 sm:p-8 text-white">
        <span aria-hidden="true" className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            {isCurrentUserLoading ? (
              <Skeleton className="h-8 w-56 bg-white/30" />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {greeting()}
                {firstName ? `, ${firstName}` : ""}!
              </h1>
            )}
            <p className="text-sm text-white/85">
              {orderSummary?.activeOrders
                ? `You have ${orderSummary.activeOrders} order${orderSummary.activeOrders === 1 ? "" : "s"} on the way.`
                : "Here's everything about your account in one place."}
            </p>
          </div>
          <Link
            href="/product"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-greenPrimary-700 shadow-sm transition-colors hover:bg-greenPrimary-950"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          icon={Package}
          label="Total orders"
          value={orderSummary?.totalOrders ?? 0}
          href="/my-account/order"
          isLoading={isOrderSummaryLoading}
          accent="bg-sky-50 text-sky-600"
        />
        <StatTile
          icon={Truck}
          label="On the way"
          value={orderSummary?.activeOrders ?? 0}
          href="/my-account/order?status=active"
          isLoading={isOrderSummaryLoading}
          accent="bg-violet-50 text-violet-600"
        />
        <StatTile
          icon={Heart}
          label="Wishlist"
          value={wishlistItems.length}
          href="/my-account/wishlist"
          isLoading={isWishlistLoading}
          accent="bg-rose-50 text-rose-500"
        />
        <StatTile
          icon={Wallet}
          label="Total spent"
          value={formatBDT(orderSummary?.totalSpent ?? 0)}
          href="/my-account/order"
          hint="Excludes cancelled orders"
          isLoading={isOrderSummaryLoading}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* ================= RECENT ORDERS ================= */}
        <div className="flex flex-col gap-4 xl:col-span-2 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutralPrimary-800">Recent orders</h2>
            {customerOrders.length > 0 && (
              <Link
                href="/my-account/order"
                className="inline-flex items-center gap-1 text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {isUserOrdersLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))
          ) : customerOrders.length === 0 ? (
            <EmptyPanel
              icon={ShoppingBag}
              title="No orders yet"
              description="Your orders will show up here so you can track them."
              action={
                <Link href="/product" className={primaryButtonClass}>
                  Start shopping
                </Link>
              }
            />
          ) : (
            customerOrders.map((order) => <OrderCard key={order.id} order={order} compact />)
          )}
        </div>

        {/* ================= SIDE COLUMN ================= */}
        <div className="flex flex-col gap-6 min-w-0">
          {!isCurrentUserLoading && !isUserAddressLoading && !isSetupComplete && (
            <AccountCard className="p-5">
              <AccountCardTitle
                icon={Sparkles}
                title="Finish setting up"
                action={
                  <span className="text-sm font-bold text-greenPrimary-600">
                    {setupDone}/{setupSteps.length}
                  </span>
                }
              />
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutralPrimary-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-greenPrimary-500 to-greenPrimary-200 transition-[width] duration-500"
                  style={{ width: `${(setupDone / setupSteps.length) * 100}%` }}
                />
              </div>
              <ul className="mt-3 flex flex-col gap-0.5">
                {setupSteps.map((step) => {
                  const content = (
                    <>
                      {step.done ? (
                        <CircleCheck className="h-4 w-4 shrink-0 text-success-600" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-neutralPrimary-300" />
                      )}
                      <span className={cn("flex-1", step.done ? "text-neutralPrimary-400 line-through" : "text-neutralPrimary-700")}>
                        {step.label}
                      </span>
                    </>
                  );
                  return (
                    <li key={step.label}>
                      {!step.done && step.href ? (
                        <Link href={step.href} className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-greenPrimary-950">
                          {content}
                          <ArrowRight className="h-3.5 w-3.5 text-neutralPrimary-400" />
                        </Link>
                      ) : (
                        <div className="-mx-2 flex items-center gap-2.5 px-2 py-2 text-sm">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccountCard>
          )}

          {/* ==== DEFAULT ADDRESS ==== */}
          <AccountCard className="p-5">
            <AccountCardTitle
              icon={MapPin}
              title="Default address"
              action={
                <Link href="/my-account/addresses" className="text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700">
                  {defaultAddress ? "Manage" : "Add"}
                </Link>
              }
            />
            {isUserAddressLoading ? (
              <Skeleton className="mt-4 h-16 w-full" />
            ) : defaultAddress ? (
              <address className="mt-4 flex flex-col gap-0.5 text-sm not-italic text-neutralPrimary-700">
                <span className="font-semibold text-neutralPrimary-800">{defaultAddress.street}</span>
                <span>
                  {[
                    defaultAddress.city,
                    orderDeliveryRegions.find((r) => r.id === defaultAddress.state)?.name ?? defaultAddress.state,
                    defaultAddress.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                {customerAddresses.length > 1 && (
                  <span className="mt-1 text-xs text-neutralPrimary-500">
                    + {customerAddresses.length - 1} more saved
                  </span>
                )}
              </address>
            ) : (
              <p className="mt-4 text-sm text-neutralPrimary-500">
                Save an address to check out faster.
              </p>
            )}
          </AccountCard>

          {/* ==== WISHLIST PREVIEW ==== */}
          <AccountCard className="p-5">
            <AccountCardTitle
              icon={Heart}
              title="Wishlist"
              action={
                wishlistItems.length > 0 ? (
                  <Link href="/my-account/wishlist" className="text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700">
                    View all
                  </Link>
                ) : undefined
              }
            />
            {isWishlistLoading ? (
              <Skeleton className="mt-4 h-16 w-full" />
            ) : wishlistItems.length === 0 ? (
              <p className="mt-4 text-sm text-neutralPrimary-500">
                Tap the <Heart className="inline h-3.5 w-3.5 -mt-0.5" /> on a product to save it for later.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {wishlistItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/product-details/${item.product.slug}`}
                    title={item.product.name}
                    className="relative aspect-square overflow-hidden rounded-xl bg-neutralPrimary-100 ring-1 ring-neutralPrimary-200 transition hover:ring-greenPrimary-400"
                  >
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="80px" className="object-contain p-1" />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto h-5 w-5 text-neutralPrimary-300" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </AccountCard>
        </div>
      </div>
    </section>
  );
}
