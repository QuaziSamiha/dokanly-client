"use client";

import React from "react";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";

interface IPaginationProps {
  metaData: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function CustomPagination({
  metaData,
  onPageChange,
  isLoading = false,
}: IPaginationProps) {
  if (isLoading || !metaData) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const { totalPages, currentPage } = metaData;
  // const { totalItems, totalPages, currentPage, itemsPerPage } = metaData;

  // const fromRow = (currentPage - 1) * itemsPerPage + 1;
  // const toRow = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage > totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pages;
  };

  return (
    <section className="max-md:px-0 px-6 py-3 mt-8">
      <div className="flex max-md:flex-col items-center justify-center max-md:gap-2">
        {/* Showing X–Y from Z */}
        {/* <div className="flex gap-1 text-sm text-neutralPrimary-500 font-medium">
          <span>Showing</span>{" "}
          <span>
            {fromRow}-{toRow}
          </span>{" "}
          <span>from</span> <span>{totalItems}</span>
        </div> */}

        {/* Pagination buttons */}
        <div className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 px-2 py-1 border rounded bg-greenPrimary-500 text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <GrFormPrevious />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 px-2 py-1 border rounded text-white cursor-pointer ${
                  currentPage === page
                    ? "bg-greenPrimary-800"
                    : "bg-greenPrimary-500 hover:bg-greenPrimary-600"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-3 text-gray-500">
                ...
              </span>
            )
          )}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 px-2 py-1 border rounded bg-greenPrimary-500 text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <GrFormNext />
          </button>
        </div>
      </div>
    </section>
  );
}
