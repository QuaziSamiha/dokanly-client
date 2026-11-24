
/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IProductFilterOptions } from "@/modules/product/types/product.types";

export function useProductFilter() {
  const router = useRouter(); //* The Action Hook. It is used to programmatically change the route or perform navigation actions.
  const searchParams = useSearchParams(); //* The Reader Hook. It is used to read the Query Parameters (the part after the ? in a URL).
  const pathname = usePathname(); //* The Location Hook. It is used to read the current URL path (the part before the ?)

  const [filters, setFilters] = useState<IProductFilterOptions>({
    page: 1,
    limit: 9,
  });

  // Initialize filters from URL
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const initialFilters: IProductFilterOptions = {
      page: 1,
      limit: 9,
    };

    if (params.priceRange) {
      initialFilters.priceRange = params.priceRange as any;
    }

    if (params.parentCategories) {
      initialFilters.parentCategoryIds = params.parentCategories
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    }

    if (params.categories) {
      initialFilters.categoryIds = params.categories
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    }

    if (params.search) {
      initialFilters.searchTerm = params.search;
    }

    if (params.sortBy) {
      initialFilters.sortBy = params.sortBy as any;
    }

    if (params.sortOrder) {
      initialFilters.sortOrder = params.sortOrder as any;
    }

    if (params.page) {
      initialFilters.page = parseInt(params.page);
    }

    if (params.limit) {
      initialFilters.limit = parseInt(params.limit);
    }

    setFilters(initialFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters: IProductFilterOptions) => {
      const params = new URLSearchParams();

      if (newFilters.priceRange) {
        params.set("priceRange", newFilters.priceRange);
      }

      if (newFilters.parentCategoryIds?.length) {
        params.set("parentCategories", newFilters.parentCategoryIds.join(","));
      }

      if (newFilters.categoryIds?.length) {
        params.set("categories", newFilters.categoryIds.join(","));
      }

      if (newFilters.searchTerm) {
        params.set("search", newFilters.searchTerm);
      }

      if (newFilters.sortBy) {
        params.set("sortBy", newFilters.sortBy);
      }

      if (newFilters.sortOrder) {
        params.set("sortOrder", newFilters.sortOrder);
      }

      if (newFilters.page && newFilters.page > 1) {
        params.set("page", newFilters.page.toString());
      }

      if (newFilters.limit && newFilters.limit !== 9) {
        params.set("limit", newFilters.limit.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname],
  );

  //* ======= Update a specific filter ========
  const updateFilter = useCallback(
    <K extends keyof IProductFilterOptions>(
      key: K,
      value: IProductFilterOptions[K],
    ) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        if (key !== "page") {
          newFilters.page = 1;
        }
        updateUrl(newFilters);
        return newFilters;
      });
    },
    [updateUrl],
  );

  //* ======= Clear all filters ====
  const clearFilters = useCallback(() => {
    const newFilters = { page: 1, limit: 9 };
    setFilters(newFilters);
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params: Record<string, string> = {};

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case "under-100":
          params.maxPrice = "99";
          break;
        case "100-199":
          params.minPrice = "100";
          params.maxPrice = "199";
          break;
        case "200-299":
          params.minPrice = "200";
          params.maxPrice = "299";
          break;
        case "300-plus":
          params.minPrice = "300";
          break;
      }
    }

    if (filters.parentCategoryIds?.length) {
      params.parentCategoryId = filters.parentCategoryIds[0].toString();
    }

    if (filters.categoryIds?.length) {
      params.categoryIds = JSON.stringify(filters.categoryIds);
    }

    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    return params;
  };

  // Helper getters
  const selectedCategories = filters.parentCategoryIds || [];
  const selectedProductTypes = filters.categoryIds || [];
  const selectedPriceRanges = filters.priceRange ? [filters.priceRange] : [];
  const isAnyFilterActive = Object.keys(filters).some(
    (key) =>
      !["page", "limit"].includes(key) &&
      filters[key as keyof IProductFilterOptions],
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    buildQueryParams,
    selectedCategories,
    selectedProductTypes,
    selectedPriceRanges,
    isAnyFilterActive,
  };
}
