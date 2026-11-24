"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/data-display/table/CustomTable";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import { useInventoryQuery } from "@/modules/inventory/hooks/useInventory";
import type { IStockLot } from "@/modules/inventory/types/inventory.types";
import {
  expiryHint,
  expiryTone,
  formatDate,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import { FilterBar, FilterSelect, FilterToggle, ProductCell } from "../shared/InventoryUi";

const EXPIRY_FILTER = [
  { value: "", label: "Any expiry" },
  { value: "0", label: "Already expired" },
  { value: "30", label: "Within 30 days" },
  { value: "90", label: "Within 90 days" },
  { value: "180", label: "Within 6 months" },
];

/** Batches (lots) with their expiry dates and where their stock is. */
export default function LotsTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [expiringWithinDays, setExpiring] = useState("");
  const [onlyWithStock, setOnlyWithStock] = useState(true);

  const { data, meta, isLoading } = useInventoryQuery<IStockLot[]>(INVENTORY_API.LOTS, {
    page,
    limit,
    search,
    expiringWithinDays,
    onlyWithStock: onlyWithStock || undefined,
  });

  const columns: ColumnDef<IStockLot>[] = [
    {
      accessorKey: "lotNumber",
      header: "Batch",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold tracking-wide text-neutralPrimary-800">{row.original.lotNumber}</span>
          <span className="text-[11px] text-neutralPrimary-400">Received {formatDate(row.original.receivedAt)}</span>
        </div>
      ),
    },
    { accessorKey: "product", header: "Product", cell: ({ row }) => <ProductCell product={row.original.product} /> },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => row.original.supplier?.name ?? <span className="text-neutralPrimary-300">—</span>,
    },
    {
      accessorKey: "expiresAt",
      header: "Expiry",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="font-medium">{formatDate(row.original.expiresAt)}</span>
          <span className={`text-[11px] font-medium ${expiryTone(row.original.daysToExpiry)}`}>
            {expiryHint(row.original.daysToExpiry)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "manufacturedAt",
      header: "Made",
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.manufacturedAt)}</span>,
    },
    { accessorKey: "unitCost", header: "Unit cost", cell: ({ row }) => formatTk(row.original.unitCost) },
    {
      accessorKey: "totalOnHand",
      header: "On hand",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold tabular-nums text-neutralPrimary-800">{formatQty(row.original.totalOnHand)}</span>
          <span className="text-[11px] text-neutralPrimary-400">
            {row.original.warehouses.map((w) => `${w.warehouse.code} ${w.onHand}`).join(" · ") || "No stock left"}
          </span>
        </div>
      ),
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  return (
    <section className="flex flex-col gap-4">
      <FilterBar>
        <FilterSelect label="Expiry" value={expiringWithinDays} onChange={setExpiring} options={EXPIRY_FILTER} />
        <FilterToggle label="Only batches with stock" checked={onlyWithStock} onChange={setOnlyWithStock} />
      </FilterBar>
      <CustomTable<IStockLot>
        key={`${expiringWithinDays}|${onlyWithStock}`}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search batch number..."
      />
    </section>
  );
}
