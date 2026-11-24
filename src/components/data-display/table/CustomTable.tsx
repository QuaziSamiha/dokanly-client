"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Pagination from "./Pagination";
import TableSkeleton from "./TableSkeleton";
import {
  LuArrowDown,
  LuArrowUp,
  LuArrowUpDown,
  LuInbox,
  LuSearch,
} from "react-icons/lu";
import { ICustomTable } from "@/types";
import debounce from "lodash.debounce";

export default function CustomTable<T extends object>({
  data,
  columns,
  isLoading,
  pageCount,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  searchPlaceholder = "Search...",
  showSearchbar = true,
  toolbar,
  pageResetKey,
}: ICustomTable<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  // console.log(globalFilter);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //? CURRENT PAGE
    pageSize: pageSize, //? LIMIT
  });

  //* Debounce
  //? Without useMemo, the debounce() function would be recreated on every render, resetting its internal timer — and debounce wouldn’t actually work properly.
  const debouncedSearch = useMemo(
    () =>
      //* creates a “debounced” function that waits 500 ms after the last keystroke before calling onSearchChange
      debounce((value: string) => {
        onSearchChange?.(value);
      }, 500),
    [onSearchChange],
  );

  useEffect(() => {
    debouncedSearch(globalFilter); //* Whenever the user types (i.e., globalFilter changes), Call the debouncedSearch function with the current text. But because it’s debounced, the actual onSearchChange won’t run immediately — only after 500 ms of no typing.
  }, [globalFilter, debouncedSearch]);

  useEffect(() => {
    onPageChange?.(pagination.pageIndex + 1);
    onPageSizeChange?.(pagination.pageSize);
  }, [pagination, onPageChange, onPageSizeChange]);

  // * A new filter can have fewer pages than the one being viewed.
  useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [pageResetKey]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    onPaginationChange: setPagination,
    onSortingChange: (update) => {
      const newSorting = update instanceof Function ? update(sorting) : update;
      setSorting(newSorting);
      if (newSorting[0]) {
        const { id, desc } = newSorting[0];
        onSortChange?.(id, desc ? "desc" : "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <section className="flex flex-col gap-4">
      {showSearchbar && (
        <section className="flex flex-col gap-3 rounded-lg border border-neutralPrimary-200 bg-white p-3 shadow-neutral02 xl:flex-row xl:items-center xl:justify-between">
          {/* //? ================ SEARCH | FILTER ============= */}
          {/* * With a toolbar, search and filters only share a row from xl up;
              below that the filters get their own row so they never squeeze. */}
          <div
            className={`flex h-10 w-full shrink-0 items-center rounded-lg border border-neutralPrimary-300 bg-neutralPrimary-50 px-3 transition-all duration-200 focus-within:border-greenPrimary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-greenPrimary-500/10 ${
              toolbar ? "md:w-1/2 xl:w-1/3" : "md:w-1/3"
            }`}
          >
            <LuSearch className="shrink-0 text-base text-neutralPrimary-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent px-2.5 text-sm text-neutralPrimary-700 outline-none placeholder:text-neutralPrimary-400"
            />
          </div>
          {toolbar}
        </section>
      )}

      {/* Table */}
      <section className="overflow-x-auto scroll-auto rounded-lg border border-neutralPrimary-200 bg-white shadow-neutral02">
        <table className="min-w-full border-collapse">
          <thead className="bg-neutralPrimary-50">
            {table.getHeaderGroups().map((headerGroup, index) => (
              <tr key={index} className="">
                {headerGroup.headers.map((header, index) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={index}
                      className={`group select-none whitespace-nowrap border-b border-neutralPrimary-200 px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-neutralPrimary-500 ${
                        canSort
                          ? "cursor-pointer transition-colors duration-150 hover:bg-neutralPrimary-100 hover:text-neutralPrimary-800"
                          : ""
                      } ${header.column.columnDef.meta?.className ?? ""}`}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler?.()
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="text-sm transition-colors">
                            {
                              {
                                asc: (
                                  <LuArrowUp className="text-greenPrimary-500" />
                                ),
                                desc: (
                                  <LuArrowDown className="text-greenPrimary-500" />
                                ),
                                false: (
                                  <LuArrowUpDown className="text-neutralPrimary-300 transition-colors group-hover:text-neutralPrimary-500" />
                                ),
                              }[header.column.getIsSorted() as string]
                            }
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-neutralPrimary-100 bg-white">
            {isLoading ? (
              <TableSkeleton columns={columns.length} rows={8} />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-grab transition-colors duration-150 hover:bg-greenPrimary-950/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-6 py-4 align-middle text-sm text-neutralPrimary-700 ${
                        cell.column.columnDef.meta?.className ?? ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-500">
                      <LuInbox className="text-2xl" />
                    </div>
                    <div className="text-base font-semibold text-neutralPrimary-700">
                      No data found
                    </div>
                    {globalFilter && (
                      <div className="text-sm text-neutralPrimary-500">
                        No results match &quot;{globalFilter}&quot;
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {/* //? ============ PAGINATION ========== */}
      <Pagination table={table} totalItems={totalItems} />
    </section>
  );
}
