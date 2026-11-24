"use client";

import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTable from "@/components/data-display/table/CustomTable";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CommonButton from "@/components/primitives/button/CommonButton";
import { MdAdd } from "react-icons/md";
import {
  IProduct,
  IProductFilters,
  IProductStats,
} from "@/modules/product/types/product.types";
import { productColumns } from "./product.columns";
import { useTableModals } from "@/hooks/table/useTableModals";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import ViewProduct from "./ViewProduct";
import ProductFilters from "./product-list/ProductFilters";
import useCategory from "@/modules/category/hooks/useCategory";
// import { useDelete } from "@/hooks/api/useDelete";
// import { ARCHIVE_CONFIRM_MESSAGE } from "@/modules/product/constants/product-admin.constants";

// Same responsive steps as the Category page: near full-width on phones,
// capped on large screens. Editing has its own page, like adding.
const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl";

const HEADER_BUTTON =
  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-neutralPrimary-300 bg-white px-3 text-sm font-medium text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50 disabled:cursor-not-allowed disabled:opacity-50";

const SORT_FIELDS: { value: NonNullable<IProductFilters["sortBy"]>; label: string }[] = [
  { value: "createdAt", label: "Date added" },
  { value: "updatedAt", label: "Last updated" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "quantity", label: "Stock quantity" },
];

// * What "desc" / "asc" mean for each sort column, for the toggle's label.
const SORT_LABELS: Record<
  NonNullable<IProductFilters["sortBy"]>,
  { desc: string; asc: string }
> = {
  createdAt: { desc: "Newest first", asc: "Oldest first" },
  updatedAt: { desc: "Recently updated", asc: "Least recently updated" },
  name: { desc: "Name Z–A", asc: "Name A–Z" },
  price: { desc: "Price high–low", asc: "Price low–high" },
  quantity: { desc: "Most stock", asc: "Least stock" },
};

export default function Products() {
  const router = useRouter();
  const { allActiveCategory, activeCategoryDataLoading } = useCategory();
  const { viewData, modals, setModal, handleView } = useTableModals<IProduct>();
  const handleEdit = (product: IProduct) =>
    router.push(`/products/edit/${encodeURIComponent(product.slug)}`);

  // Delete is switched off until there is a business policy for it.
  // Soft delete: the server sets status ARCHIVED; the list refetches.
  // const { mutate: deleteProduct } = useDelete("getAdminProducts");
  // const handleDelete = (product: IProduct) => {
  //   if (window.confirm(ARCHIVE_CONFIRM_MESSAGE)) {
  //     deleteProduct(`/products/${product.id}`);
  //   }
  // };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<IProductFilters>({});

  // * Undefined values are dropped by axios, so only set filters are sent.
  const filterParams = { search: searchTerm || undefined, sortOrder, ...filters };
  const queryParams = { page: currentPage, limit: pageSize, ...filterParams };

  // GET /products returns every status to admins and takes the table's
  // filters; /products/active is the shop grid.
  const {
    data: productData,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
    refetch: refetchProducts,
  } = useGetAll<{ data: IProduct[]; meta: IPaginationMeta }>(
    `/products`,
    ["getAdminProducts", JSON.stringify(queryParams)],
    queryParams,
  );

  const { data: stats, refetch: refetchStats } = useGet<IProductStats>(
    `/products/stats`,
    ["getProductStats"],
  );

  // * A refresh usually returns in ~100ms with the same rows, which looks like
  // * nothing happened; keep the spinner up briefly and confirm with a toast.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshAll = async () => {
    setIsRefreshing(true);
    const minimumSpin = new Promise((resolve) => setTimeout(resolve, 600));
    const [products, counts] = await Promise.all([
      refetchProducts(),
      refetchStats(),
      minimumSpin,
    ]);
    setIsRefreshing(false);
    if (products.isError || counts.isError) {
      toast.error("Couldn't refresh products. Please try again.");
    } else {
      toast.success("Products are up to date", { duration: 1500 });
    }
  };

  // * Any filter change starts again from page 1.
  const applyFilters = (patch: Partial<IProductFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setCurrentPage(1);
  };
  const applySearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const sortLabel = SORT_LABELS[filters.sortBy ?? "createdAt"][sortOrder];
  const columns = productColumns(handleView, handleEdit);
  // * Any change here sends the table back to page 1.
  const pageResetKey = JSON.stringify(filterParams);

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
            Product
          </h1>
          <p className="mt-0.5 text-sm text-neutralPrimary-500">
            Add, edit, publish or hide products from the shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="product-sort-by">
            Sort by
          </label>
          <select
            id="product-sort-by"
            value={filters.sortBy ?? "createdAt"}
            onChange={(e) =>
              applyFilters({
                sortBy:
                  e.target.value === "createdAt"
                    ? undefined
                    : (e.target.value as IProductFilters["sortBy"]),
              })
            }
            className={`${HEADER_BUTTON} pr-2 outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30`}
            title="Sort the list by"
          >
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                Sort: {field.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setSortOrder((s) => (s === "desc" ? "asc" : "desc"));
              setCurrentPage(1);
            }}
            className={HEADER_BUTTON}
            title="Reverse the order of the list"
          >
            {sortOrder === "desc" ? (
              <ArrowDownWideNarrow size={16} />
            ) : (
              <ArrowUpNarrowWide size={16} />
            )}
            {sortLabel}
          </button>
          {/* * Too many categories for buttons, so a select beside the sort. */}
          <label className="sr-only" htmlFor="product-category">
            Category
          </label>
          <select
            id="product-category"
            value={filters.parentCategoryId ?? ""}
            onChange={(e) =>
              applyFilters({ parentCategoryId: e.target.value || undefined })
            }
            disabled={activeCategoryDataLoading}
            className={`${HEADER_BUTTON} max-w-[14rem] pr-2 outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 disabled:cursor-wait`}
            title="Filter by category"
          >
            <option value="" className="bg-white text-neutralPrimary-700">
              All categories
            </option>
            {allActiveCategory.map((c) => (
              <option
                key={c.id}
                value={String(c.id)}
                className="bg-white text-neutralPrimary-700"
              >
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refreshAll}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            className={HEADER_BUTTON}
          >
            <RefreshCw
              size={16}
              className={isRefreshing || isProductFetching ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link href="/products/add-product">
            <CommonButton label="Add Product" IconComponent={MdAdd} />
          </Link>
        </div>
      </section>

      {/* Table, with search and filters in its toolbar (as on Category) */}
      <CustomTable<IProduct>
        data={Array.isArray(productData?.data) ? productData.data : []}
        columns={columns}
        isLoading={isProductLoading}
        pageCount={productData?.meta?.totalPages || 1}
        totalItems={productData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={applySearch}
        searchPlaceholder="Search by name, slug or SKU..."
        toolbar={
          <ProductFilters
            filters={filters}
            stats={stats}
            onChange={applyFilters}
          />
        }
        pageResetKey={pageResetKey}
      />

      <CustomModal2
        open={modals.view}
        onOpenChange={setModal.view}
        dialogWidth={VIEW_MODAL_WIDTH}
        // The dialog is centred then pushed down 32px (mt-8), and the fixed
        // navbar (80px) sits above it; 100dvh - 7rem keeps its top clear of
        // the navbar on short screens such as a phone held sideways.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        <ViewProduct data={viewData} setOpen={setModal.view} />
      </CustomModal2>
    </section>
  );
}
