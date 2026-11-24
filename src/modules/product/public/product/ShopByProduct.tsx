"use client";

import { PRODUCT_TYPES } from "@/modules/product/constants/product.constants";
import { useProductFilter } from "@/modules/product/hooks/useProductFilter";
import React from "react";

export default function ShopByProduct() {
  const { filters, selectedProductTypes, updateFilter } = useProductFilter();
  const handleCheckbox = (typeId: number, checked: boolean) => {
    const current = filters.categoryIds || [];
    const updated = checked
      ? [...current, typeId]
      : current.filter((id) => id !== typeId);
    updateFilter("categoryIds", updated.length > 0 ? updated : undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-neutralPrimary-900 font-semibold">
        Shop By Products
      </p>
      <div className="flex flex-col gap-3">
        {PRODUCT_TYPES?.map((product) => (
          <label
            key={product.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedProductTypes.includes(product.id)}
              onChange={(e) => handleCheckbox(product.id, e.target.checked)}
              className="cursor-pointer w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              disabled={
                filters.parentCategoryIds &&
                !filters.parentCategoryIds.includes(product.parentId)
              }
            />
            <span
              className={`text-sm font-medium ${
                filters.parentCategoryIds &&
                !filters.parentCategoryIds.includes(product.parentId)
                  ? "text-neutralPrimary-400"
                  : "text-neutralPrimary-800"
              }`}
            >
              {product.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
