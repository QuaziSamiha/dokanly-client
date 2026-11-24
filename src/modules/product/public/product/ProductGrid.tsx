import React from "react";
import CustomPagination from "@/components/data-display/pagination/CustomPagination";
import { ProductCard } from "@/modules/product/shared/ProductCard";
import ProductCardSkeleton from "@/modules/product/shared/ProductCardSkeleton";
import { useProductPagination } from "@/modules/product/hooks/useProductPagination";
import { useProductFilter } from "@/modules/product/hooks/useProductFilter";
import { EmptyState } from "@/components/feedback/placeholders/EmptyState";

export default function ProductGrid() {
  const { products, isProductLoading, metaData, setCurrentPage } =
    useProductPagination();
  const { isAnyFilterActive, selectedCategories, selectedPriceRanges } =
    useProductFilter();

  const totalItems = metaData?.totalItems || 0;
  const currentPage = metaData?.currentPage || 1;
  const itemsPerPage = metaData?.itemsPerPage || 10;

  const fromRow = (currentPage - 1) * itemsPerPage + 1;
  const toRow = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="basis-full lg:basis-3/4 w-full">
      <main className="flex flex-col gap-4 max-lg:pt-4">
        {/* Filter status display */}
        {isAnyFilterActive && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-primary-800">
                Active Filters:
              </span>

              {selectedCategories.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  {selectedCategories.length} Category
                </span>
              )}

              {selectedPriceRanges.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  Price: {selectedPriceRanges[0]}
                </span>
              )}
            </div>
          </div>
        )}

        {metaData && metaData.totalPages > 1 && (
          <div className="flex gap-1 text-sm text-neutralPrimary-500 font-medium">
            <span>Showing</span>{" "}
            <span>
              {fromRow}-{toRow}
            </span>{" "}
            <span>from</span> <span>{totalItems}</span>
          </div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-10">
          {isProductLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : products?.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product?.id} product={product} />
            ))
          ) : (
            <div className="col-span-2 xl:col-span-3 text-center py-12">
              {/* <p className="text-neutralPrimary-600 text-lg">
                No products found with the selected filters.
              </p> */}
              <EmptyState />
            </div>
          )}
        </div>
      </main>

      {metaData && metaData.totalPages > 1 && (
        <CustomPagination
          metaData={metaData}
          onPageChange={handlePageChange}
          isLoading={isProductLoading}
        />
      )}
    </section>
  );
}
