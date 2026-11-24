"use client";

import ProfileAvatar from "@/components/primitives/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_NAV,
  IAccountNavItem,
  isNavItemActive,
} from "@/modules/account/constants/account-nav.constants";
import { logout } from "@/modules/auth/services/auth.service";
import { useUserOrderSummary } from "@/modules/order/hooks/useUserOrders";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { ChevronRight, Headset, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

/** The customer account navigation: a card on desktop, scrollable tabs on phones. */
export default function CustomerSidebar() {
  const pathname = usePathname();
  const { currentUserData: user, isCurrentUserLoading } = useCurrentUser();
  const { orderSummary } = useUserOrderSummary();
  const { wishlistCount } = useWishlistIds();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const badgeFor = (item: IAccountNavItem) => {
    if (item.badge === "activeOrders") return orderSummary?.activeOrders || 0;
    if (item.badge === "wishlist") return wishlistCount;
    return 0;
  };

  //* ==== SAME SEQUENCE AS THE NAVBAR MENU: APP TOKENS FIRST, THEN NEXTAUTH ====
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout("/login");
    await signOut({ callbackUrl: "/login", redirect: true });
  };

  const name = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-32">
      {/* ================= PHONES & TABLETS: SCROLLABLE TABS ================= */}
      <nav
        aria-label="My account"
        className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-2 w-max pb-1">
          {ACCOUNT_NAV.map((item) => {
            const active = isNavItemActive(item, pathname);
            const count = badgeFor(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full border px-4 h-10 text-sm font-semibold transition-colors",
                    active
                      ? "border-greenPrimary-500 bg-greenPrimary-500 text-white"
                      : "border-neutralPrimary-300 bg-white text-neutralPrimary-700",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "min-w-5 h-5 px-1.5 rounded-full text-[11px] leading-5 text-center",
                        active ? "bg-white/25 text-white" : "bg-greenPrimary-950 text-greenPrimary-700",
                      )}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-neutralPrimary-300 bg-white px-4 h-10 text-sm font-semibold text-destructive-600 cursor-pointer disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </li>
        </ul>
      </nav>

      {/* ================= DESKTOP: CARD ================= */}
      <div className="hidden lg:flex flex-col gap-4">
        <section className="bg-white border border-neutralPrimary-300/70 rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          {/* ==== WHO IS SIGNED IN ==== */}
          <div className="flex items-center gap-3 p-5 bg-linear-to-br from-greenPrimary-950 to-white border-b border-neutralPrimary-200">
            {isCurrentUserLoading ? (
              <>
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full ring-2 ring-white shadow-sm shrink-0">
                  <ProfileAvatar
                    src={user?.profileImageUrl}
                    name={name || user?.email}
                    sizeClass="w-12 h-12"
                    fallbackTextClass="text-lg"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-medium text-neutralPrimary-500">
                    Hello,
                  </p>
                  <p className="text-base font-semibold text-neutralPrimary-800 truncate">
                    {name || "there"}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-neutralPrimary-500 truncate" title={user.email}>
                      {user.email}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ==== PAGES ==== */}
          <nav aria-label="My account" className="p-2">
            <ul className="flex flex-col gap-0.5">
              {ACCOUNT_NAV.map((item) => {
                const active = isNavItemActive(item, pathname);
                const count = badgeFor(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200",
                        active
                          ? "bg-greenPrimary-950 text-greenPrimary-700"
                          : "text-neutralPrimary-700 hover:bg-neutralPrimary-50",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-greenPrimary-500" />
                      )}
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-greenPrimary-500 text-white"
                            : "bg-neutralPrimary-100 text-neutralPrimary-600 group-hover:bg-white",
                        )}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                      </span>
                      <span className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className="text-xs text-neutralPrimary-500 truncate">
                          {item.description}
                        </span>
                      </span>
                      {count > 0 ? (
                        <span className="min-w-6 h-6 px-2 rounded-full bg-greenPrimary-500 text-white text-xs font-semibold leading-6 text-center">
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-transform",
                            active ? "text-greenPrimary-500" : "text-neutralPrimary-300 group-hover:translate-x-0.5",
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-neutralPrimary-200 p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive-600 transition-colors hover:bg-destructive-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive-50">
                <LogOut className="w-[18px] h-[18px]" />
              </span>
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </section>

        {/* ==== HELP ==== */}
        <Link
          href="/contact-us"
          className="group flex items-center gap-3 rounded-2xl border border-neutralPrimary-300/70 bg-white p-4 transition-colors hover:border-greenPrimary-300"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600">
            <Headset className="w-5 h-5" />
          </span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-neutralPrimary-800">
              Need help?
            </span>
            <span className="text-xs text-neutralPrimary-500">
              Questions about an order? Contact us.
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-neutralPrimary-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}
