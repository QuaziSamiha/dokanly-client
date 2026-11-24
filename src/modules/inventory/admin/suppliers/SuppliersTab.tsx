"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone } from "lucide-react";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import AddButton from "@/components/primitives/button/AddButton";
import {
  INVENTORY_API,
  RECORD_STATUS_BADGE,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { ISupplier } from "@/modules/inventory/types/inventory.types";
import {
  FilterBar,
  FilterSelect,
  MODAL_WIDTH,
  RowActions,
  StatusBadge,
} from "../shared/InventoryUi";
import SupplierForm from "./SupplierForm";

const STATUS_FILTER = [
  { value: "", label: "Active & inactive" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function SuppliersTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formTarget, setFormTarget] = useState<ISupplier | "new" | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ISupplier | null>(null);

  const { data, meta, isLoading } = useInventoryQuery<ISupplier[]>(
    INVENTORY_API.SUPPLIERS,
    { page, limit, search, status },
  );
  const archive = useInventoryMutation(() => setArchiveTarget(null));

  const columns: ColumnDef<ISupplier>[] = [
    {
      accessorKey: "code",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="flex min-w-[12rem] flex-col">
          <span className="font-mono text-sm font-bold tracking-wide text-neutralPrimary-800">{row.original.code}</span>
          <span className="truncate text-xs text-neutralPrimary-500">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex min-w-[11rem] flex-col gap-0.5 text-xs">
            <span className="text-sm text-neutralPrimary-700">{s.contactName ?? "—"}</span>
            {s.phone && (
              <span className="inline-flex items-center gap-1 text-neutralPrimary-500"><Phone size={11} />{s.phone}</span>
            )}
            {s.email && (
              <span className="inline-flex items-center gap-1 text-neutralPrimary-500"><Mail size={11} />{s.email}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "leadTimeDays",
      header: "Lead time",
      cell: ({ row }) =>
        row.original.leadTimeDays == null ? "—" : `${row.original.leadTimeDays} days`,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[18rem] text-xs text-neutralPrimary-500" title={row.original.notes ?? ""}>
          {row.original.notes ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge badge={RECORD_STATUS_BADGE[row.original.status]} />,
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => {
        const s = row.original;
        const archived = s.status === "ARCHIVED";
        return (
          <RowActions>
            <button type="button" disabled={archived} onClick={() => setFormTarget(s)} className="disabled:opacity-40">
              <CustomTooltip action="edit" content={archived ? "Archived (read-only)" : "Edit"} />
            </button>
            <button type="button" disabled={archived} onClick={() => setArchiveTarget(s)} className="disabled:pointer-events-none disabled:opacity-40">
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
        <AddButton label="Add Supplier" setOpen={() => setFormTarget("new")} />
      </div>

      <CustomTable<ISupplier>
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
        searchPlaceholder="Search code, name, contact, phone or email..."
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
          <SupplierForm supplier={formTarget === "new" ? undefined : formTarget} onClose={() => setFormTarget(null)} />
        )}
      </CustomModal2>

      <ConfirmModal
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={`Archive ${archiveTarget?.code}?`}
        description="The supplier can no longer get purchase orders. Past orders and batches keep their link. Refused while it has orders in progress."
        confirmLabel="Archive"
        variant="warning"
        isPending={archive.isPending}
        onConfirm={() =>
          archiveTarget &&
          archive.mutate({ method: "delete", endpoint: `${INVENTORY_API.SUPPLIERS}/${archiveTarget.id}` })
        }
      />
    </section>
  );
}
