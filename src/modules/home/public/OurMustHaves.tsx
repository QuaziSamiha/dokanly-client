"use client";
import CustomCarousel from "@/components/data-display/carousel/CustomCarousel";
import CustomTab from "@/components/primitives/tab/CustomTab";
import { tabList } from "@/modules/home/constants/home.constants";
import { useProduct } from "@/modules/product/hooks/useProduct";
import { ITabContent } from "@/types";
import React from "react";

export default function OurMustHaves() {
  const {
    productData,
    hairCare,
    skinCare,
    bodyCare,
    others,
    isProductLoading,
  } = useProduct();

  const tabContent: ITabContent[] = [
    {
      value: "all",
      content: (
        <CustomCarousel
          products={productData ?? []}
          isLoading={isProductLoading}
        />
      ),
    },
    {
      value: "hair care",
      content: (
        <CustomCarousel
          products={hairCare ?? []}
          isLoading={isProductLoading}
        />
      ),
    },
    {
      value: "skin care",
      content: (
        <CustomCarousel
          products={skinCare ?? []}
          isLoading={isProductLoading}
        />
      ),
    },
    {
      value: "body care",
      content: (
        <CustomCarousel
          products={bodyCare ?? []}
          isLoading={isProductLoading}
        />
      ),
    },
    {
      value: "other",
      content: (
        <CustomCarousel products={others ?? []} isLoading={isProductLoading} />
      ),
    },
  ];

  return (
    <section className="md:mx-4 2xl:mx-0">
      <main className="flex flex-col justify-center items-center max-lg:gap-0.5 gap-4">
        <p className="text-center text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold">
          <span className="text-warningPrimary-500">Our </span>
          <span className="text-greenPrimary-500">Must-Haves</span>
        </p>
        <div className="w-full flex flex-col items-center justify-center">
          <CustomTab
            defaultTab="all"
            tabList={tabList}
            tabContent={tabContent}
          />
        </div>
      </main>
    </section>
  );
}
