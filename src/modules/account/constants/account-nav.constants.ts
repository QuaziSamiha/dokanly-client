import {
  Heart,
  LayoutDashboard,
  LucideIcon,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";

export interface IAccountNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown under the label in the sidebar */
  description: string;
  /** Only this exact path is active (the overview would otherwise match every page) */
  exact?: boolean;
  /** Which live count the sidebar shows as a badge */
  badge?: "activeOrders" | "wishlist";
}

export const ACCOUNT_NAV: IAccountNavItem[] = [
  {
    label: "Overview",
    href: "/my-account",
    icon: LayoutDashboard,
    description: "Your account at a glance",
    exact: true,
  },
  {
    label: "My Orders",
    href: "/my-account/order",
    icon: Package,
    description: "Track, cancel or reorder",
    badge: "activeOrders",
  },
  {
    label: "Wishlist",
    href: "/my-account/wishlist",
    icon: Heart,
    description: "Products you saved",
    badge: "wishlist",
  },
  {
    label: "Addresses",
    href: "/my-account/addresses",
    icon: MapPin,
    description: "Where we deliver",
  },
  {
    label: "Account Details",
    href: "/my-account/account-information",
    icon: UserRound,
    description: "Profile, password & security",
  },
];

export const isNavItemActive = (item: IAccountNavItem, pathname: string) =>
  item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

/** The page title for the hero and breadcrumb. */
export const accountPageTitle = (pathname: string) => {
  if (/^\/my-account\/order\/[^/]+$/.test(pathname)) return "Order Details";
  return (
    ACCOUNT_NAV.find((item) => isNavItemActive(item, pathname))?.label ??
    "My Account"
  );
};
