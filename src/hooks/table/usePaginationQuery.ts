import { useState, useMemo } from "react";

interface IPaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSortOrder?: "asc" | "desc";
}

/**
 * A reusable hook to handle pagination, search, and sorting for API queries.
 * Keeps parameters consistent across components and memoizes query params.
 */
export const usePaginationQuery = ({
  initialPage = 1,
  initialLimit = 10,
  initialSearch = "",
  initialSortOrder = "asc",
}: IPaginationOptions = {}) => {
  console.log(initialLimit);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialLimit);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      sortOrder,
    }),
    [currentPage, pageSize, searchTerm, sortOrder]
  );

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    queryParams,
  };
};

// ? usage
// const {
//   currentPage,
//   setCurrentPage,
//   pageSize,
//   setPageSize,
//   queryParams,
//   searchTerm,
//   sortOrder,
// } = usePaginationQuery({ initialLimit: 20 }); // default = 20, can change dynamically

// const {
//   data: categoryData,
//   isLoading,
//   refetch,
// } = useGetAll<{ data: ICategory[]; meta: IMeta }>(
//   "/categories/all",
//   ["categories", currentPage, pageSize],
//   queryParams
// );
