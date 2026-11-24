"use client";

import Hero from "@/components/layout/hero/Hero";
import React, { useState } from "react";
import ProductGrid from "./ProductGrid";
import ProductSidebar from "./ProductSidebar";

export default function Product() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <section className="w-full">
      <Hero heroHeading="Our Products" />
      <main className="container mx-auto">
        <section className="flex flex-col gap-8 justify-center items-center pt-8 max-xl:px-4 mb-8">
          <section className="lg:flex w-full gap-16">
            <ProductSidebar
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
            />
            <ProductGrid />
          </section>
        </section>
      </main>
    </section>
  );
}
