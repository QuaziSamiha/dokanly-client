"use client";

import { RiResetLeftLine } from "react-icons/ri";
import { BsFilterSquare } from "react-icons/bs";
import { useProductFilter } from "@/modules/product/hooks/useProductFilter";
import { IProductFilter } from "@/modules/product/types/product.types";
import PriceRange from "./PriceRange";
import ShopByCategory from "./ShopByCategory";
import ShopByProduct from "./ShopByProduct";
import { RxCross2 } from "react-icons/rx";

export default function ProductSidebar({
  isFilterOpen,
  setIsFilterOpen,
}: IProductFilter) {
  const { clearFilters, isAnyFilterActive } = useProductFilter();
  return (
    <section className="basis-0 lg:basis-1/4">
      {/* //* ======================== Desktop Sidebar ========================== */}
      <main className="flex flex-col gap-4">
        <div className="flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 text-neutralPrimary-700 text-sm rounded-lg font-semibold"
          >
            <BsFilterSquare className="text-lg" />
            Filter
          </button>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutralPrimary-800 cursor-pointer text-neutralPrimary-700 text-sm font-semibold hover:bg-neutralPrimary-50 transition-colors"
            >
              <RiResetLeftLine />
              Reset Filters
            </button>
          )}
        </div>

        <div className="max-lg:hidden flex flex-col gap-4">
          <PriceRange />
          <ShopByCategory />
          <ShopByProduct />
        </div>
      </main>

      {/* //* ======================== Mobile Drawer ============= */}
      <main>
        {isFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[9998]"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <div
          className={`lg:hidden fixed top-24 left-0 h-full w-2/3 max-w-sm bg-white shadow-lg transform transition-transform duration-300 z-[9999] ${
            isFilterOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-neutralPrimary-800">
              Filters
            </h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-neutralPrimary-600 text-xl hover:text-neutralPrimary-800"
            >
              <RxCross2 />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
            {/* Filters */}
            <div className="flex flex-col gap-2">
              <PriceRange />
              <ShopByCategory />
              <ShopByProduct />
            </div>
            {/* Apply/Clear buttons for mobile */}
            <div className="sticky bottom-0 bg-white pt-4 border-t mt-4">
              <button
                onClick={() => {
                  clearFilters();
                  setIsFilterOpen(false);
                }}
                className="flex-1 px-4 py-2 border border-neutralPrimary-300 rounded-lg text-neutralPrimary-700 font-medium hover:bg-neutralPrimary-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
