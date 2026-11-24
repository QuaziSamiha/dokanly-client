import type { ReactNode } from "react";
import { ColumnDef, RowData, Table } from "@tanstack/react-table";

// Per-column options read by CustomTable.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Added to the column's <th> and <td>, e.g. "hidden md:table-cell" to hide it on phones. */
    className?: string;
  }
}

// ================= TABLE ==============
export interface ICustomTable<T extends object> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  pageCount?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (value: string) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  searchPlaceholder?: string;
  showSearchbar?: boolean;
  /** Extra controls (e.g. filters) shown next to the search box. */
  toolbar?: ReactNode;
  /** Jumps back to page 1 whenever this value changes, e.g. on a new filter. */
  pageResetKey?: string;
}

export interface IPagination<T extends object> {
  table: Table<T>;
  totalItems?: number;
  isLoading?: boolean;
}
