"use client";

import CustomPagination from "@/components/data-display/pagination/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AccountPageHeader,
  EmptyPanel,
  primaryButtonClass,
} from "@/modules/account/customer/AccountUI";
import {
  useUserOrders,
  useUserOrderSummary,
} from "@/modules/order/hooks/useUserOrders";
import { CustomerOrderGroup } from "@/modules/order/types/order.types";
import { CUSTOMER_ORDER_TABS } from "@/modules/order/utils/customer-order.utils";
import { PackageSearch, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import OrderCard from "./OrderCard";

const PAGE_SIZE = 5;
type Tab = CustomerOrderGroup | "ALL";
const TAB_VALUES = CUSTOMER_ORDER_TABS.map((t) => t.value);

/** "My orders": tabs, search by order number, and one card per order. */
export default function Order() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //* ==== TAB AND PAGE LIVE IN THE URL, SO BACK/REFRESH AND SHARED LINKS KEEP THEM ====
  const rawTab = (searchParams.get("status") ?? "ALL").toUpperCase() as Tab;
  const tab: Tab = TAB_VALUES.includes(rawTab) ? rawTab : "ALL";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const search = searchParams.get("q") ?? "";

  const setQuery = (next: { status?: Tab; page?: number; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const apply = (key: string, value?: string | number) => {
      if (value === undefined || value === "" || value === "ALL" || value === 1) params.delete(key);
      else params.set(key, String(value).toLowerCase());
    };
    if ("status" in next) apply("status", next.status);
    if ("page" in next) apply("page", next.page);
    if ("q" in next) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  //* ==== DEBOUNCED SEARCH: ONE REQUEST AFTER THE CUSTOMER STOPS TYPING ====
  useEffect(() => {
    const value = searchInput.trim();
    if (value === search) return;
    const timer = setTimeout(() => setQuery({ q: value, page: 1 }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { orderSummary } = useUserOrderSummary();
  const { customerOrders, meta, isUserOrdersLoading, isUserOrdersFetching } =
    useUserOrders({
      page,
      limit: PAGE_SIZE,
      search,
      group: tab === "ALL" ? undefined : tab,
    });

  const hasNoOrdersAtAll = orderSummary?.totalOrders === 0;

  return (
    <section className="flex flex-col gap-6">
      <AccountPageHeader
        title="My Orders"
        description="Track deliveries, see what you ordered and get your invoices."
      />

      {hasNoOrdersAtAll ? (
        <EmptyPanel
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place an order, you'll be able to track it here."
          action={
            <Link href="/product" className={primaryButtonClass}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          {/* ================= TABS + SEARCH ================= */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div
              role="tablist"
              aria-label="Filter orders"
              className="flex gap-1 overflow-x-auto rounded-xl bg-neutralPrimary-100 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {CUSTOMER_ORDER_TABS.map((t) => {
                const active = t.value === tab;
                const count = orderSummary?.[t.countKey];
                return (
                  <button
                    key={t.value}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setQuery({ status: t.value, page: 1 })}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 h-9 text-sm font-semibold transition-colors cursor-pointer",
                      active
                        ? "bg-white text-greenPrimary-700 shadow-sm"
                        : "text-neutralPrimary-600 hover:text-neutralPrimary-800",
                    )}
                  >
                    {t.label}
                    {count !== undefined && (
                      <span
                        className={cn(
                          "min-w-5 rounded-full px-1.5 text-[11px] leading-5 text-center",
                          active ? "bg-greenPrimary-950 text-greenPrimary-700" : "bg-white/70 text-neutralPrimary-500",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <label className="relative md:w-72">
              <span className="sr-only">Search by order number</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutralPrimary-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number"
                className="h-11 w-full rounded-xl border border-neutralPrimary-300 bg-white pl-9 pr-9 text-sm text-neutralPrimary-800 placeholder:text-neutralPrimary-400 focus:border-greenPrimary-400 focus:outline-none focus:ring-4 focus:ring-greenPrimary-500/15 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutralPrimary-400 hover:text-neutralPrimary-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>

          {/* ================= LIST ================= */}
          {isUserOrdersLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
          ) : customerOrders.length === 0 ? (
            <EmptyPanel
              icon={PackageSearch}
              title={search ? "No matching orders" : "Nothing here yet"}
              description={
                search
                  ? `We couldn't find an order matching "${search}".`
                  : "You have no orders in this list."
              }
              action={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className={primaryButtonClass}
                  >
                    Clear search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuery({ status: "ALL", page: 1 })}
                    className={primaryButtonClass}
                  >
                    See all orders
                  </button>
                )
              }
            />
          ) : (
            <div
              className={cn(
                "flex flex-col gap-4 transition-opacity",
                isUserOrdersFetching && "opacity-60",
              )}
              aria-busy={isUserOrdersFetching}
            >
              {customerOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col items-center gap-1">
              <CustomPagination
                metaData={meta}
                onPageChange={(next) => {
                  setQuery({ page: next });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <p className="text-xs text-neutralPrimary-500">
                Showing {(meta.currentPage - 1) * meta.itemsPerPage + 1}–
                {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} of{" "}
                {meta.totalItems} orders
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
