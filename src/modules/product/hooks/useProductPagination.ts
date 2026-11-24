"use client";

import { useEffect, useState } from "react";
import { useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IProduct } from "@/modules/product/types/product.types";
import { useProductFilter } from "./useProductFilter";

export function useProductPagination() {
  const { filters, buildQueryParams } = useProductFilter();
  const [currentPage, setCurrentPage] = useState<number>(filters.page || 1);
  const [pageSize, setPageSize] = useState<number>(filters.limit || 9);

  // Build all query params
  const filterParams = buildQueryParams();
  const allQueryParams = {
    page: currentPage,
    limit: pageSize,
    ...filterParams,
  };

  // ALWAYS use the same endpoint
  const endpoint = `/products/active`;

  const {
    data,
    isLoading: isProductLoading,
    refetch: refetchProduct,
  } = useGetAll<{ data: IProduct[]; meta: IPaginationMeta }>(
    endpoint,
    [
      "getProductWithPagination",
      endpoint,
      String(currentPage),
      String(pageSize),
      JSON.stringify(filterParams),
    ],
    allQueryParams
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [JSON.stringify(filterParams)]);

  const productData = data?.data;
  const metaData = data?.meta;
  const products = Array.isArray(productData) ? productData : [];

  return {
    productData,
    metaData,
    products,
    isProductLoading,
    refetchProduct,
    setCurrentPage,
    setPageSize,
    currentPage,
    pageSize,
  };
}


// "use client";

// import { useEffect, useState } from "react";
// import { useGetAll } from "@/hooks/api/useGet";
// import { IPaginationMeta } from "@/types";
// import { IProduct } from "@/modules/product/types/product.types";

// export function useProductPagination() {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(9);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

//   const queryParams = {
//     page: currentPage,
//     limit: pageSize,
//     search: searchTerm || undefined,
//     sortOrder: sortOrder || undefined,
//   };

//   const {
//     data,
//     isLoading: isProductLoading,
//     refetch: refetchProduct,
//   } = useGetAll<{ data: IProduct[]; meta: IPaginationMeta }>(
//     `/products/active`,
//     [
//       "getProductWithPagination",
//       String(currentPage),
//       String(pageSize),
//       searchTerm,
//       sortOrder,
//     ],
//     queryParams
//   );

//   // Reset to page 1 when search or filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, sortOrder, pageSize]);

//   const productData = data?.data;
//   const metaData = data?.meta;
//   const products = Array.isArray(productData) ? productData : [];
//   return {
//     productData,
//     metaData,
//     products,
//     isProductLoading,
//     refetchProduct,
//     setCurrentPage,
//     setPageSize,
//     setSearchTerm,
//     setSortOrder,
//     currentPage,
//     pageSize,
//   };
// }
