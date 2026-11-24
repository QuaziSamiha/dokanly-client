"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { BsBox } from "react-icons/bs";
import { AiOutlineUnorderedList } from "react-icons/ai";
import {
  MdOutlineCategory,
  MdOutlineContactSupport,
  MdOutlineDeliveryDining,
  MdWorkHistory,
} from "react-icons/md";
// import { VscFileMedia } from "react-icons/vsc";
import { PiUserCircleGearFill } from "react-icons/pi";
import { RiCouponLine } from "react-icons/ri";
import { GrContact } from "react-icons/gr";
import { BiNotepad } from "react-icons/bi";
import { TbHomeCog, TbSettingsDollar } from "react-icons/tb";
import { SiGoogleanalytics } from "react-icons/si";
import { LuWarehouse } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileAvatar from "@/components/primitives/ProfileAvatar";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { IUser } from "@/modules/user/types/user.types";

// `employee` items are the store-operations pages employees can open; keep in
// sync with EMPLOYEE_ROUTES in middleware.ts.
const menuItems: {
  label: string;
  href: string;
  icon: IconType;
  employee?: boolean;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: RxDashboard, employee: true },
  { label: "Analytics", href: "/analytics", icon: SiGoogleanalytics },
  { label: "Home", href: "/home-content", icon: TbHomeCog },
  { label: "Users", href: "/all-users", icon: PiUserCircleGearFill },
  {
    label: "Category",
    href: "/category",
    icon: MdOutlineCategory,
    employee: true,
  },
  { label: "Product", href: "/products", icon: BsBox, employee: true },
  { label: "Inventory", href: "/inventory", icon: LuWarehouse, employee: true },
  {
    label: "Delivery Pricing",
    href: "/delivery-pricing",
    icon: MdOutlineDeliveryDining,
  },
  {
    label: "Free Delivery",
    href: "/free-delivery-settings",
    icon: TbSettingsDollar,
  },
  { label: "Promotions", href: "/promotions", icon: RiCouponLine },
  {
    label: "Order",
    href: "/order-list",
    icon: AiOutlineUnorderedList,
    employee: true,
  },
  // { label: "Media & News", href: "/admin-media-news", icon: VscFileMedia },
  { label: "Career", href: "/career-admin", icon: MdWorkHistory },
  { label: "Blog", href: "/blog-admin", icon: BiNotepad },
  { label: "Contact", href: "/contact", icon: GrContact },
  { label: "Support", href: "/support", icon: MdOutlineContactSupport },
];

export default function AdminSidebar() {
  const pathName = usePathname();
  const { currentUserData, isCurrentUserLoading, isUserEmployee } =
    useCurrentUser<IUser>();
  const visibleItems = isUserEmployee
    ? menuItems.filter((item) => item.employee)
    : menuItems;

  const isProfileActive = pathName === "/profile";
  const profileName = currentUserData?.name || currentUserData?.email;

  // Nested pages (e.g. /products/123) keep their parent menu item highlighted
  const isActive = (href: string) =>
    pathName === href || pathName.startsWith(`${href}/`);

  return (
    // Sits under the 5rem admin top bar, so the height subtracts it to keep the last items reachable
    <aside className="fixed bg-white flex flex-col gap-1 w-[240px] border-r border-neutralPrimary-200 h-[calc(100dvh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 px-3 py-4 max-lg:w-full max-lg:max-w-[280px] max-lg:shadow-xl">
      {/* ============= PROFILE MENU ============= */}
      <Link
        href="/profile"
        aria-current={isProfileActive ? "page" : undefined}
        className={`${
          isProfileActive
            ? "bg-greenPrimary-950 ring-1 ring-greenPrimary-200"
            : "bg-neutralPrimary-50 hover:bg-neutralPrimary-100"
        } group flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40`}
      >
        {isCurrentUserLoading ? (
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        ) : (
          <ProfileAvatar
            src={currentUserData?.profileImageUrl}
            name={profileName}
            sizeClass="w-10 h-10"
          />
        )}

        {isCurrentUserLoading ? (
          <div className="flex flex-col gap-1.5 w-full">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        ) : (
          <div className="flex min-w-0 flex-col items-start justify-start gap-0.5">
            <p className="w-full truncate text-sm font-semibold leading-5 text-neutralPrimary-900">
              {profileName}
            </p>
            <p
              className={`${
                isProfileActive
                  ? "text-greenPrimary-600"
                  : "text-neutralPrimary-500"
              } text-xs font-medium leading-4 capitalize`}
            >
              {currentUserData?.role?.toLowerCase()}
            </p>
          </div>
        )}
      </Link>

      <div className="my-3 border-b border-neutralPrimary-200" />

      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${
                active
                  ? "bg-greenPrimary-500 text-white font-semibold shadow-sm"
                  : "text-neutralPrimary-600 font-medium hover:bg-neutralPrimary-100 hover:text-neutralPrimary-900"
              } group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40`}
            >
              <item.icon
                className={`${
                  active
                    ? "text-white"
                    : "text-neutralPrimary-400 group-hover:text-greenPrimary-600"
                } h-[18px] w-[18px] shrink-0 transition-colors duration-150`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
