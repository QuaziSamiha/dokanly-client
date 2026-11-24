"use client";

import { PRICE_RANGES } from "@/modules/product/constants/product.constants";
import { useProductFilter } from "@/modules/product/hooks/useProductFilter";
import { TProductPriceRange } from "@/modules/product/types/product.types";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PriceRange() {
  const { filters, updateFilter } = useProductFilter();
  
  const handlePriceRangeChange = (value: string) => {
    updateFilter("priceRange", value as TProductPriceRange);
  };

  const selectedPriceRange = filters.priceRange || "";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-neutralPrimary-800 font-semibold">Price</p>
      <RadioGroup
        value={selectedPriceRange}
        onValueChange={handlePriceRangeChange}
        className="flex flex-col gap-3"
      >
        {PRICE_RANGES.map((range) => {
          return (
            <label
              key={range.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <RadioGroupItem value={range.value} />
              <span className="text-sm text-neutralPrimary-800 font-medium">
                {range.label}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
