"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import AddButton from "@/components/primitives/button/AddButton";
import {
  INVENTORY_API,
  TRANSFER_STATUS_BADGE,
  transferStatusFilterOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryOptions,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockTransfer } from "@/modules/inventory/types/inventory.types";
import { formatDate, formatQty } from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  MODAL_WIDTH,
  RowActions,
  StatusBadge,
} from "../shared/InventoryUi";
import TransferDetail from "./TransferDetail";
import TransferForm from "./TransferForm";

export default function TransfersTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [modal, setModal] = useState<{ kind: "view"; id: number } | { kind: "form" } | null>(null);

  const { warehouses } = useInventoryOptions();
  const { data, meta, isLoading } = useInventoryQuery<IStockTransfer[]>(
    INVENTORY_API.TRANSFERS,
    { page, limit, search, status, warehouseId },
  );

  const columns: ColumnDef<IStockTransfer>[] = [
    {
      accessorKey: "transferNumber",
      header: "Transfer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-neutralPrimary-800">{row.original.transferNumber}</span>
          <span className="text-[11px] text-neutralPrimary-400">Created {formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      accessorKey: "route",
      header: "Route",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-xs font-semibold">
          {row.original.fromWarehouse.code}
          <ArrowRight size={13} className="text-neutralPrimary-400" />
          {row.original.toWarehouse.code}
        </span>
      ),
    },
    {
      accessorKey: "items",
      header: "Units",
      cell: ({ row }) => {
        const sent = row.original.items.reduce((s, i) => s + i.quantitySent, 0);
        const short = row.original.items.reduce((s, i) => s + (i.shortfall ?? 0), 0);
        return (
          <div className="flex flex-col">
            <span className="tabular-nums">
              {formatQty(sent)} <span className="text-xs text-neutralPrimary-400">in {row.original.items.length} line{row.original.items.length === 1 ? "" : "s"}</span>
            </span>
            {short > 0 && <span className="text-[11px] font-medium text-destructive-600">{short} lost in transit</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge badge={TRANSFER_STATUS_BADGE[row.original.status]} />,
    },
    {
      accessorKey: "shippedAt",
      header: "Shipped / received",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap text-xs">
          <span>{formatDate(row.original.shippedAt)}</span>
          <span className="text-neutralPrimary-400">{formatDate(row.original.receivedAt)}</span>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <RowActions>
          <button type="button" onClick={() => setModal({ kind: "view", id: row.original.id })}>
            <CustomTooltip action="view" content="View" />
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
          <FilterSelect label="Status" value={status} onChange={setStatus} options={transferStatusFilterOptions} />
          <FilterSelect
            label="Warehouse"
            value={warehouseId}
            onChange={setWarehouseId}
            options={[{ value: "", label: "Any warehouse" }, ...warehouses.map((w) => ({ value: String(w.id), label: w.code }))]}
          />
        </FilterBar>
        <AddButton label="New Transfer" setOpen={() => setModal({ kind: "form" })} />
      </div>

      <CustomTable<IStockTransfer>
        key={`${status}|${warehouseId}`}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search transfer number or notes..."
      />

      <CustomModal2
        open={!!modal}
        onOpenChange={(open) => !open && setModal(null)}
        dialogWidth={modal?.kind === "view" ? MODAL_WIDTH.view : MODAL_WIDTH.form}
        // Centred, then pushed down 32px (mt-8) under the fixed 80px navbar:
        // 100dvh - 7rem keeps the top clear of the navbar on short screens.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        {modal?.kind === "view" && <TransferDetail transferId={modal.id} />}
        {modal?.kind === "form" && <TransferForm onClose={() => setModal(null)} />}
      </CustomModal2>
    </section>
  );
}
