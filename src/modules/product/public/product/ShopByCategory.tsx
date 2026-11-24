"use client";

import { PARENT_CATEGORIES } from "@/modules/product/constants/product.constants";
import { useProductFilter } from "@/modules/product/hooks/useProductFilter";
import React from "react";

export default function ShopByCategory() {
  const { selectedCategories, updateFilter, filters } = useProductFilter();
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    const current = filters.parentCategoryIds || [];
    const updated = checked
      ? [...current, categoryId]
      : current.filter((id) => id !== categoryId);
    updateFilter("parentCategoryIds", updated.length > 0 ? updated : undefined);
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-neutralPrimary-800 font-semibold">
        Shop by Category
      </p>

      <div className="flex flex-col gap-3">
        {PARENT_CATEGORIES.map((category) => (
          <label
            key={category.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={(e) =>
                handleCategoryChange(category.id, e.target.checked)
              }
              className="cursor-pointer w-4 h-4 text-neutralPrimary-600 rounded focus:ring-neutralPrimary-500"
            />
            <span className="text-sm text-neutralPrimary-800 font-medium">
              {category.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
