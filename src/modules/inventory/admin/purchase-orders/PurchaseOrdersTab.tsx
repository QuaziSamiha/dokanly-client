"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import AddButton from "@/components/primitives/button/AddButton";
import {
  INVENTORY_API,
  PO_STATUS_BADGE,
  poStatusFilterOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryOptions,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IPurchaseOrder } from "@/modules/inventory/types/inventory.types";
import {
  formatDate,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  MODAL_WIDTH,
  RowActions,
  StatusBadge,
} from "../shared/InventoryUi";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderForm from "./PurchaseOrderForm";
import ReceivePurchaseOrderForm from "./ReceivePurchaseOrderForm";

type ModalState =
  | { kind: "view"; id: number }
  | { kind: "form"; po?: IPurchaseOrder }
  | { kind: "receive"; po: IPurchaseOrder }
  | null;

export default function PurchaseOrdersTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  const { supplierOptions } = useInventoryOptions();
  const { data, meta, isLoading } = useInventoryQuery<IPurchaseOrder[]>(
    INVENTORY_API.PURCHASE_ORDERS,
    { page, limit, search, status, supplierId },
  );

  const close = () => setModal(null);

  const columns: ColumnDef<IPurchaseOrder>[] = [
    {
      accessorKey: "poNumber",
      header: "PO",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-neutralPrimary-800">{row.original.poNumber}</span>
          <span className="text-[11px] text-neutralPrimary-400">Created {formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="flex max-w-[14rem] flex-col">
          <span className="truncate font-medium">{row.original.supplier.name}</span>
          <span className="text-[11px] text-neutralPrimary-400">to {row.original.warehouse.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge badge={PO_STATUS_BADGE[row.original.status]} />,
    },
    {
      accessorKey: "items",
      header: "Received",
      cell: ({ row }) => {
        const ordered = row.original.items.reduce((s, i) => s + i.quantityOrdered, 0);
        const received = row.original.items.reduce((s, i) => s + i.quantityReceived, 0);
        const pct = ordered ? Math.round((received / ordered) * 100) : 0;
        return (
          <div className="flex min-w-[8rem] flex-col gap-1">
            <span className="whitespace-nowrap text-sm">
              <b>{formatQty(received)}</b>
              <span className="text-neutralPrimary-400"> / {formatQty(ordered)}</span>
            </span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-neutralPrimary-100">
              <span className="block h-full rounded-full bg-greenPrimary-500" style={{ width: `${pct}%` }} />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="whitespace-nowrap font-medium tabular-nums">{formatTk(row.original.total)}</span>,
    },
    {
      accessorKey: "expectedAt",
      header: "Expected",
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.expectedAt)}</span>,
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <RowActions>
          <button type="button" onClick={() => setModal({ kind: "view", id: row.original.id })}>
            <CustomTooltip action="view" content="View" />
          </button>
          {row.original.status === "DRAFT" && (
            <button type="button" onClick={() => setModal({ kind: "form", po: row.original })}>
              <CustomTooltip action="edit" content="Edit draft" />
            </button>
          )}
        </RowActions>
      ),
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={poStatusFilterOptions} />
          <FilterSelect
            label="Supplier"
            value={supplierId}
            onChange={setSupplierId}
            options={[{ value: "", label: "All suppliers" }, ...supplierOptions.map((s) => ({ value: String(s.id), label: s.name }))]}
          />
        </FilterBar>
        <AddButton label="New Purchase Order" setOpen={() => setModal({ kind: "form" })} />
      </div>

      <CustomTable<IPurchaseOrder>
        key={`${status}|${supplierId}`}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search PO or invoice number..."
      />

      <CustomModal2
        open={!!modal}
        onOpenChange={(open) => !open && close()}
        dialogWidth={modal?.kind === "view" ? MODAL_WIDTH.view : MODAL_WIDTH.form}
        // Centred, then pushed down 32px (mt-8) under the fixed 80px navbar:
        // 100dvh - 7rem keeps the top clear of the navbar on short screens.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        {modal?.kind === "view" && (
          <PurchaseOrderDetail
            purchaseOrderId={modal.id}
            onEdit={(po) => setModal({ kind: "form", po })}
            onReceive={(po) => setModal({ kind: "receive", po })}
          />
        )}
        {modal?.kind === "form" && <PurchaseOrderForm purchaseOrder={modal.po} onClose={close} />}
        {modal?.kind === "receive" && <ReceivePurchaseOrderForm purchaseOrder={modal.po} onClose={close} />}
      </CustomModal2>
    </section>
  );
}
