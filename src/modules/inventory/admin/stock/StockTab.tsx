"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import {
  INVENTORY_API,
  STOCK_STATE_BADGE,
  stockStateFilterOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryOptions,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockLevel } from "@/modules/inventory/types/inventory.types";
import {
  stockItemKey,
  formatDateTime,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  FilterToggle,
  MODAL_WIDTH,
  ProductCell,
  RowActions,
  StatusBadge,
  WarehouseCell,
} from "../shared/InventoryUi";
import StockSettingsForm from "./StockSettingsForm";

/** Stock per stock item (product, or size of a VARIABLE product) per warehouse. `onShowHistory` opens the ledger for a row. */
export default function StockTab({
  onShowHistory,
}: {
  /** `itemKey` is a stockItemKey: "12", or "12:41" for a size. */
  onShowHistory: (itemKey: string, warehouseId: number) => void;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [state, setState] = useState("");
  const [onlyWithStock, setOnlyWithStock] = useState(false);
  const [settingsTarget, setSettingsTarget] = useState<IStockLevel | null>(null);

  const { warehouses } = useInventoryOptions();
  const { data, meta, isLoading } = useInventoryQuery<IStockLevel[]>(
    INVENTORY_API.STOCK,
    { page, limit, search, warehouseId, state, onlyWithStock: onlyWithStock || undefined },
  );

  const num = (value: number, className = "") => (
    <span className={`tabular-nums ${className}`}>{formatQty(value)}</span>
  );

  const columns: ColumnDef<IStockLevel>[] = [
    { accessorKey: "product", header: "Product", cell: ({ row }) => <ProductCell product={row.original.product} /> },
    { accessorKey: "warehouse", header: "Warehouse", cell: ({ row }) => <WarehouseCell warehouse={row.original.warehouse} /> },
    { accessorKey: "onHand", header: "On hand", cell: ({ row }) => num(row.original.onHand, "font-semibold text-neutralPrimary-800") },
    {
      accessorKey: "reserved",
      header: "Reserved",
      cell: ({ row }) => num(row.original.reserved, row.original.reserved ? "text-blueSecondary-600" : "text-neutralPrimary-400"),
    },
    {
      accessorKey: "available",
      header: "Available",
      cell: ({ row }) => num(row.original.available, "font-semibold text-greenPrimary-700"),
    },
    {
      accessorKey: "incoming",
      header: "Incoming",
      cell: ({ row }) =>
        row.original.incoming ? num(row.original.incoming, "text-blueSecondary-600") : <span className="text-neutralPrimary-300">—</span>,
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-0.5">
          <StatusBadge badge={STOCK_STATE_BADGE[row.original.state]} />
          <span className="text-[11px] text-neutralPrimary-400">
            {row.original.reorderPoint != null
              ? `Reorder at ${row.original.reorderPoint}`
              : "Default threshold"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "stockValue",
      header: "Value",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="font-medium">{formatTk(row.original.stockValue)}</span>
          <span className="text-[11px] text-neutralPrimary-400">avg {formatTk(row.original.avgUnitCost)}</span>
        </div>
      ),
    },
    {
      accessorKey: "lastMovementAt",
      header: "Last movement",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-neutralPrimary-500">{formatDateTime(row.original.lastMovementAt)}</span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <RowActions>
          <button
            type="button"
            onClick={() =>
              onShowHistory(
                stockItemKey(
                  row.original.product.id,
                  row.original.product.variantId,
                ),
                row.original.warehouse.id,
              )
            }
          >
            <CustomTooltip action="view" content="Stock history" />
          </button>
          <button type="button" onClick={() => setSettingsTarget(row.original)}>
            <CustomTooltip action="edit" content="Reorder settings" />
          </button>
        </RowActions>
      ),
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  const filterKey = `${warehouseId}|${state}|${onlyWithStock}`;

  return (
    <section className="flex flex-col gap-4">
      <FilterBar>
        <FilterSelect
          label="Warehouse"
          value={warehouseId}
          onChange={setWarehouseId}
          options={[
            { value: "", label: "All warehouses" },
            ...warehouses.map((w) => ({ value: String(w.id), label: `${w.code} · ${w.name}` })),
          ]}
        />
        <FilterSelect label="State" value={state} onChange={setState} options={stockStateFilterOptions} />
        <FilterToggle label="Only rows with stock" checked={onlyWithStock} onChange={setOnlyWithStock} />
      </FilterBar>

      <CustomTable<IStockLevel>
        key={filterKey}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search product name, slug or SKU..."
      />

      <CustomModal2
        open={!!settingsTarget}
        onOpenChange={(open) => !open && setSettingsTarget(null)}
        dialogWidth={MODAL_WIDTH.small}
        // Centred, then pushed down 32px (mt-8) under the fixed 80px navbar:
        // 100dvh - 7rem keeps the top clear of the navbar on short screens.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        {settingsTarget && (
          <StockSettingsForm level={settingsTarget} onClose={() => setSettingsTarget(null)} />
        )}
      </CustomModal2>
    </section>
  );
}
