import { IPagination } from "@/types";
import React, { useState } from "react";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import PaginationSkeleton from "./PaginationSkeleton";
import { toast } from "sonner";

export default function Pagination<T extends object>({
  table,
  totalItems,
  isLoading,
}: IPagination<T>) {
  // console.log(totalItems);
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const [jumpPage, setJumpPage] = useState("");

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number(jumpPage);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      toast.error(`Page must be between 1 and ${pageCount}`);
      return;
    }
    table.setPageIndex(page - 1);
    setJumpPage("");
  };

  const fromRow = (currentPage - 1) * pageSize + 1;
  let toRow;
  if (totalItems) {
    toRow = Math.min(currentPage * pageSize, totalItems);
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3;
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    if (currentPage <= maxVisible) {
      pages.push(1, 2, 3, "...", pageCount);
    } else if (currentPage > pageCount - maxVisible) {
      pages.push(1, "...", pageCount - 2, pageCount - 1, pageCount);
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        pageCount
      );
    }

    return pages;
  };

  return isLoading ? (
    <PaginationSkeleton />
  ) : (
    <section className="rounded-lg border border-neutralPrimary-200 bg-white px-4 py-3 shadow-neutral02 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Showing X–Y from Z */}
        <div className="flex gap-1 text-sm text-neutralPrimary-500">
          <span>Showing</span>{" "}
          <span className="font-semibold text-neutralPrimary-700">
            {fromRow}-{toRow}
          </span>{" "}
          <span>from</span>{" "}
          <span className="font-semibold text-neutralPrimary-700">
            {totalItems}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
        {/* Jump to page */}
        <form
            onSubmit={handleJump}
            noValidate
            className="flex items-center gap-1.5 text-sm text-neutralPrimary-500"
          >
            <label htmlFor="jump-to-page">Go to page</label>
            <input
              id="jump-to-page"
              type="number"
              min={1}
              max={pageCount}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder={`1-${pageCount}`}
              className="h-8 w-20 rounded-md border border-neutralPrimary-300 bg-white px-2 text-sm text-neutralPrimary-700 outline-none transition-colors duration-150 placeholder:text-neutralPrimary-400 focus:border-greenPrimary-400 focus:ring-2 focus:ring-greenPrimary-500/20"
            />
            <button
              type="submit"
              disabled={!jumpPage}
              className="inline-flex h-8 items-center justify-center rounded-md border border-greenPrimary-500 bg-greenPrimary-500 px-3 text-sm font-medium text-white transition-colors duration-150 cursor-pointer hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Go
            </button>
          </form>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutralPrimary-300 bg-white text-lg text-neutralPrimary-600 transition-colors duration-150 cursor-pointer hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutralPrimary-300 disabled:hover:bg-white disabled:hover:text-neutralPrimary-600 [&_path]:stroke-current"
          >
            <GrFormPrevious />
          </button>

          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => table.setPageIndex(page - 1)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 ${
                  currentPage === page
                    ? "border-greenPrimary-500 bg-greenPrimary-500 text-white shadow-sm"
                    : "border-neutralPrimary-300 bg-white text-neutralPrimary-600 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-600"
                }`}
              >
                {page}
              </button>
            ) : (
              <span
                key={idx}
                className="inline-flex h-8 w-6 items-center justify-center text-sm text-neutralPrimary-400"
              >
                ...
              </span>
            )
          )}

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutralPrimary-300 bg-white text-lg text-neutralPrimary-600 transition-colors duration-150 cursor-pointer hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutralPrimary-300 disabled:hover:bg-white disabled:hover:text-neutralPrimary-600 [&_path]:stroke-current"
          >
            <GrFormNext />
          </button>
        </div>
        </div>
      </div>
    </section>
  );
}
