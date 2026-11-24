"use client";

import React from "react";
import Hero from "@/components/layout/hero/Hero";
import { useCategorizedMediaNews } from "../../hooks/usePublicMediaNews";
import CustomCarousel from "./CustomCarousel";

export default function MediaNews() {
  const { categorizedMediaNews, isCategorizedMediaNewsLoading } =
    useCategorizedMediaNews();

  return (
    <section className="w-full">
      <Hero heroHeading="Media & News" />
      <main className="container mx-auto">
        <section className=" pt-8 max-xl:px-4 mb-8">
          <div className="flex flex-col gap-20">
            {categorizedMediaNews?.media &&
              categorizedMediaNews?.media?.length > 0 && (
                <CustomCarousel
                  sectionName="Media"
                  news={categorizedMediaNews?.media || []}
                  isLoading={isCategorizedMediaNewsLoading}
                />
              )}
            {categorizedMediaNews?.news &&
              categorizedMediaNews?.news?.length > 0 && (
                <CustomCarousel
                  sectionName="News"
                  news={categorizedMediaNews?.news || []}
                  isLoading={isCategorizedMediaNewsLoading}
                />
              )}
            {categorizedMediaNews?.commercial &&
              categorizedMediaNews?.commercial?.length > 0 && (
                <CustomCarousel
                  sectionName="Commercial"
                  news={categorizedMediaNews?.commercial || []}
                  isLoading={isCategorizedMediaNewsLoading}
                />
              )}
          </div>
        </section>
      </main>
    </section>
  );
}
