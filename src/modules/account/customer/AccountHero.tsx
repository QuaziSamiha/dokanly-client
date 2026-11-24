"use client";

import Hero from "@/components/layout/hero/Hero";
import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import { accountPageTitle } from "@/modules/account/constants/account-nav.constants";
import { usePathname } from "next/navigation";

/** The account banner: its title and breadcrumb follow the current page. */
export default function AccountHero() {
  const pathname = usePathname();
  const title = accountPageTitle(pathname);
  const isOverview = pathname === "/my-account";
  const isOrderDetails = title === "Order Details";

  //* ==== CustomBreadCrumb ADDS "HOME" ITSELF ====
  const previousItemLinks = [
    ...(isOverview ? [] : [{ label: "My Account", link: "/my-account" }]),
    ...(isOrderDetails ? [{ label: "My Orders", link: "/my-account/order" }] : []),
  ];

  return (
    <Hero
      heroHeading={isOverview ? "My Account" : title}
      customBreadCrumb={
        <CustomBreadCrumb
          previousItemLinks={previousItemLinks}
          currentItem={isOverview ? "My Account" : title}
        />
      }
    />
  );
}
