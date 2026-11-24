import CustomerSidebar from "@/components/layout/sidebar/CustomerSidebar";
import Footer from "@/components/layout/footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";
import PromotionBar from "@/components/layout/promo-bar/PromotionBar";
import AccountHero from "@/modules/account/customer/AccountHero";
import AccountClientGate from "@/modules/account/customer/AccountClientGate";
import { Metadata } from "next";
import React, { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "My Account | Natura Care Limited",
  description: "Your orders, wishlist, addresses and account details.",
  //* ==== PRIVATE PAGES: NEVER INDEXED (ALSO DISALLOWED IN robots.ts) ====
  robots: { index: false, follow: false },
};

export default function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="top-0 fixed w-full z-[9999] bg-white">
        <PromotionBar />
        <Navbar />
      </div>
      <div className="flex-grow bg-backgroundPrimary mt-20">
        <AccountHero />
        <main className="container mx-auto px-4 sm:px-6">
          <section className="pt-20 lg:pt-12 pb-14">
            <AccountClientGate>
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                <CustomerSidebar />
                <div className="flex-1 min-w-0 w-full">{children}</div>
              </div>
            </AccountClientGate>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
