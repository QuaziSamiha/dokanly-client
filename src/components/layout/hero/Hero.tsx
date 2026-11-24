"use client";
import React, { ReactNode } from "react";
import Image from "next/image";

interface IProps {
  heroHeading: string;
  customBreadCrumb?: ReactNode;
}

export default function Hero({
  heroHeading = "All Products",
  customBreadCrumb,
}: IProps) {
  return (
    <section className="relative w-full mt-12 h-48 flex items-center justify-center max-lg:hidden bg-neutral-100">
      <Image src="/images/ui/banners/hero-2.png" alt="Hero Banner" fill priority />
      {/* Width-capped so a long product name in the breadcrumb truncates instead of running off-screen */}
      <div className="relative z-10 w-full max-w-5xl min-w-0 px-8">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="font-bold text-greenPrimary-500 text-2xl md:text-4xl">
            {heroHeading}
          </p>
          {customBreadCrumb}
        </div>
      </div>
    </section>
  );
}
