"use client";

import React from "react";
import SegmentedFilter from "@/components/form/SegmentedFilter";
import {
  IProduct,
  IProductFilters,
  IProductStats,
} from "@/modules/product/types/product.types";
import {
  PRODUCT_STATUS,
  STOCK_STATUS,
} from "@/modules/product/admin/product.columns";

type Status = NonNullable<IProduct["status"]>;
type Featured = NonNullable<IProductFilters["featured"]>;
type Stock = NonNullable<IProductFilters["stockStatus"]>;
// type ProductType = NonNullable<IProductFilters["type"]>;

/**
 * Toolbar of the admin product table, in the Category page's style: one
 * segmented group per filter, with live counts where the server has them.
 * Archived isn't offered: products can't be archived from the panel.
 */
export default function ProductFilters({
  filters,
  stats,
  onChange,
}: {
  filters: IProductFilters;
  stats?: IProductStats;
  onChange: (patch: Partial<IProductFilters>) => void;
}) {
  return (
    // * min-w-0 lets the groups wrap beside the search box instead of overflowing.
    <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 xl:justify-end">
      <SegmentedFilter<Status>
        label="Status"
        value={filters.status}
        onChange={(status) => onChange({ status })}
        options={[
          {
            value: undefined,
            label: "All",
            count: stats && stats.totalProducts - stats.statusCounts.ARCHIVED,
          },
          {
            value: "ACTIVE",
            label: "Active",
            count: stats?.statusCounts.ACTIVE,
            dot: PRODUCT_STATUS.ACTIVE.dot,
            title: "Live in the shop",
          },
          {
            value: "DRAFT",
            label: "Draft",
            count: stats?.statusCounts.DRAFT,
            dot: PRODUCT_STATUS.DRAFT.dot,
            title: "Not launched yet",
          },
          {
            value: "INACTIVE",
            label: "Inactive",
            count: stats?.statusCounts.INACTIVE,
            dot: PRODUCT_STATUS.INACTIVE.dot,
            title: "Hidden from the shop; can go live again",
          },
        ]}
      />

      <SegmentedFilter<Stock>
        label="Stock"
        value={filters.stockStatus}
        onChange={(stockStatus) => onChange({ stockStatus })}
        options={[
          { value: undefined, label: "All" },
          {
            value: "IN_STOCK",
            label: "In stock",
            count: stats?.inStock,
            dot: STOCK_STATUS.IN_STOCK.dot,
            title: "More than 10 units",
          },
          {
            value: "LOW_STOCK",
            label: "Low",
            count: stats?.lowStock,
            dot: STOCK_STATUS.LOW_STOCK.dot,
            title: "1 to 10 units left",
          },
          {
            value: "OUT_OF_STOCK",
            label: "Out",
            count: stats?.outOfStock,
            dot: STOCK_STATUS.OUT_OF_STOCK.dot,
            title: "No units left",
          },
        ]}
      />

      <SegmentedFilter<Featured>
        label="Featured"
        value={filters.featured}
        onChange={(featured) => onChange({ featured })}
        options={[
          { value: undefined, label: "All" },
          {
            value: "true",
            label: "Featured",
            count: stats?.featured,
            title: "Shown in “Our Must-Haves” on the home page (when Active)",
          },
          { value: "false", label: "Not featured", count: stats?.notFeatured },
        ]}
      />

      {/* Type filter hidden for now; uncomment (and the ProductType type) to bring it back. */}
      {/* <SegmentedFilter<ProductType>
        label="Type"
        value={filters.type}
        onChange={(type) => onChange({ type })}
        options={[
          { value: undefined, label: "All" },
          { value: "SIMPLE", label: "Simple" },
          { value: "VARIABLE", label: "Variable" },
          { value: "COMBO", label: "Combo" },
        ]}
      /> */}

      {/* The category select lives in the page header, beside the sort. */}
    </div>
  );
}
