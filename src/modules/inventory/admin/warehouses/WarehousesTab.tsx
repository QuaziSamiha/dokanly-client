"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import AddButton from "@/components/primitives/button/AddButton";
import {
  INVENTORY_API,
  RECORD_STATUS_BADGE,
  WAREHOUSE_TYPE_LABEL,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IWarehouse } from "@/modules/inventory/types/inventory.types";
import { formatDate } from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  MODAL_WIDTH,
  RowActions,
  StatusBadge,
} from "../shared/InventoryUi";
import WarehouseForm from "./WarehouseForm";

const STATUS_FILTER = [
  { value: "", label: "Active & inactive" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function WarehousesTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formTarget, setFormTarget] = useState<IWarehouse | "new" | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<IWarehouse | null>(null);

  const { data, meta, isLoading } = useInventoryQuery<IWarehouse[]>(
    INVENTORY_API.WAREHOUSES,
    { page, limit, search, status },
  );
  const archive = useInventoryMutation(() => setArchiveTarget(null));

  const columns: ColumnDef<IWarehouse>[] = [
    {
      accessorKey: "code",
      header: "Warehouse",
      cell: ({ row }) => (
        <div className="flex min-w-[12rem] flex-col">
          <span className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wide text-neutralPrimary-800">
            {row.original.code}
            {row.original.isDefault && (
              <span title="Default warehouse" className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-950 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase text-greenPrimary-700">
                <Star size={10} /> Default
              </span>
            )}
          </span>
          <span className="truncate text-xs text-neutralPrimary-500">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => WAREHOUSE_TYPE_LABEL[row.original.type],
    },
    {
      accessorKey: "isSellable",
      header: "Sells to shop",
      cell: ({ row }) =>
        row.original.isSellable ? (
          <span className="text-success-600">Yes</span>
        ) : (
          <span className="text-neutralPrimary-400">No</span>
        ),
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex max-w-[16rem] flex-col">
          <span>{row.original.city ?? "—"}</span>
          {row.original.street && (
            <span className="truncate text-xs text-neutralPrimary-400">{row.original.street}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge badge={RECORD_STATUS_BADGE[row.original.status]} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => {
        const w = row.original;
        const archived = w.status === "ARCHIVED";
        return (
          <RowActions>
            <button type="button" disabled={archived} onClick={() => setFormTarget(w)} className="disabled:opacity-40">
              <CustomTooltip action="edit" content={archived ? "Archived (read-only)" : "Edit"} />
            </button>
            <button
              type="button"
              disabled={archived || w.isDefault}
              onClick={() => setArchiveTarget(w)}
              className="disabled:pointer-events-none disabled:opacity-40"
            >
              <CustomTooltip action="delete" content="Archive" />
            </button>
          </RowActions>
        );
      },
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_FILTER} />
        </FilterBar>
        <AddButton label="Add Warehouse" setOpen={() => setFormTarget("new")} />
      </div>

      <CustomTable<IWarehouse>
        key={status}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search code, name or city..."
      />

      <CustomModal2
        open={!!formTarget}
        onOpenChange={(open) => !open && setFormTarget(null)}
        dialogWidth={MODAL_WIDTH.form}
        // Centred, then pushed down 32px (mt-8) under the fixed 80px navbar:
        // 100dvh - 7rem keeps the top clear of the navbar on short screens.
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        {formTarget && (
          <WarehouseForm
            warehouse={formTarget === "new" ? undefined : formTarget}
            onClose={() => setFormTarget(null)}
          />
        )}
      </CustomModal2>

      <ConfirmModal
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={`Archive ${archiveTarget?.code}?`}
        description="The warehouse is hidden from stock operations; its history is kept. It must be empty, not the default, and have no open purchase orders, transfers or draft adjustments."
        confirmLabel="Archive"
        variant="warning"
        isPending={archive.isPending}
        onConfirm={() =>
          archiveTarget &&
          archive.mutate({ method: "delete", endpoint: `${INVENTORY_API.WAREHOUSES}/${archiveTarget.id}` })
        }
      />
    </section>
  );
}
