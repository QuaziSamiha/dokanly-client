"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import AddButton from "@/components/primitives/button/AddButton";
import {
  ADJUSTMENT_REASON_LABEL,
  ADJUSTMENT_TYPE_LABEL,
  DOCUMENT_STATUS_BADGE,
  INVENTORY_API,
  adjustmentTypeFilterOptions,
  documentStatusFilterOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryOptions,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockAdjustment } from "@/modules/inventory/types/inventory.types";
import { formatDate } from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  MODAL_WIDTH,
  QtyDelta,
  RowActions,
  StatusBadge,
} from "../shared/InventoryUi";
import AdjustmentDetail from "./AdjustmentDetail";
import AdjustmentForm from "./AdjustmentForm";

export default function AdjustmentsTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [modal, setModal] = useState<{ kind: "view"; id: number } | { kind: "form" } | null>(null);

  const { warehouses } = useInventoryOptions();
  const { data, meta, isLoading } = useInventoryQuery<IStockAdjustment[]>(
    INVENTORY_API.ADJUSTMENTS,
    { page, limit, search, type, status, warehouseId },
  );

  const columns: ColumnDef<IStockAdjustment>[] = [
    {
      accessorKey: "adjustmentNumber",
      header: "Adjustment",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-neutralPrimary-800">{row.original.adjustmentNumber}</span>
          <span className="text-[11px] text-neutralPrimary-400">{ADJUSTMENT_TYPE_LABEL[row.original.type]}</span>
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.warehouse.code}</span>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (row.original.reason ? ADJUSTMENT_REASON_LABEL[row.original.reason] : "—"),
    },
    {
      accessorKey: "netChange",
      header: "Net change",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <QtyDelta value={row.original.netChange} />
          <span className="text-[11px] text-neutralPrimary-400">
            {row.original.items.length} line{row.original.items.length === 1 ? "" : "s"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge badge={DOCUMENT_STATUS_BADGE[row.original.status]} />,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap text-xs">
          <span>{formatDate(row.original.postedAt ?? row.original.createdAt)}</span>
          <span className="text-neutralPrimary-400">{row.original.postedByUser?.name ?? row.original.createdByUser?.name ?? ""}</span>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <RowActions>
          <button type="button" onClick={() => setModal({ kind: "view", id: row.original.id })}>
            <CustomTooltip action="view" content={row.original.status === "DRAFT" ? "Review & post" : "View"} />
          </button>
        </RowActions>
      ),
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar>
          <FilterSelect label="Type" value={type} onChange={setType} options={adjustmentTypeFilterOptions} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={documentStatusFilterOptions} />
          <FilterSelect
            label="Warehouse"
            value={warehouseId}
            onChange={setWarehouseId}
            options={[{ value: "", label: "All warehouses" }, ...warehouses.map((w) => ({ value: String(w.id), label: w.code }))]}
          />
        </FilterBar>
        <AddButton label="New Adjustment" setOpen={() => setModal({ kind: "form" })} />
      </div>

      <CustomTable<IStockAdjustment>
        key={`${type}|${status}|${warehouseId}`}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search adjustment number or notes..."
      />

      <CustomModal2
        open={!!modal}
        onOpenChange={(open) => !open && setModal(null)}
        dialogWidth={modal?.kind === "view" ? MODAL_WIDTH.view : MODAL_WIDTH.form}
        // Centred, then pushed down 32px (mt-8) under the fixed 80px navbar:
        // 100dvh - 7rem keeps the top clear of the navbar on short screens.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        {modal?.kind === "view" && <AdjustmentDetail adjustmentId={modal.id} />}
        {modal?.kind === "form" && <AdjustmentForm onClose={() => setModal(null)} />}
      </CustomModal2>
    </section>
  );
}
