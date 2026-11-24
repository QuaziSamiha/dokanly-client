"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Undo2, X } from "lucide-react";
import CustomTable from "@/components/data-display/table/CustomTable";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import {
  INVENTORY_API,
  INVENTORY_LIMITS,
  MOVEMENT_TYPE_BADGE,
  REVERSIBLE_MOVEMENT_TYPES,
  movementTypeFilterOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryOptions,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockMovement } from "@/modules/inventory/types/inventory.types";
import {
  splitStockItemKey,
  stockItemName,
  formatDateTime,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import {
  FilterBar,
  FilterSelect,
  ProductCell,
  QtyDelta,
  StatusBadge,
  WarehouseCell,
} from "../shared/InventoryUi";

const SOURCE_LABEL: Record<IStockMovement["source"]["kind"], string> = {
  ORDER: "Order",
  PURCHASE_ORDER: "Purchase order",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
  REVERSAL: "Reverses",
  NONE: "",
};

/**
 * The stock ledger. Start filtered on a stock item / warehouse when opened from
 * the stock tab. `productId` holds a stockItemKey ("12", or "12:41" for a size).
 */
export default function MovementsTab({
  initialProductId = "",
  initialWarehouseId = "",
}: {
  initialProductId?: string;
  initialWarehouseId?: string;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [productId, setProductId] = useState(initialProductId);
  const [warehouseId, setWarehouseId] = useState(initialWarehouseId);
  const [type, setType] = useState("");
  const [reverseTarget, setReverseTarget] = useState<IStockMovement | null>(null);
  const [note, setNote] = useState("");

  const { warehouses, productOptions } = useInventoryOptions();
  const { data, meta, isLoading } = useInventoryQuery<IStockMovement[]>(
    INVENTORY_API.MOVEMENTS,
    {
      page,
      limit,
      ...(productId ? splitStockItemKey(productId) : {}),
      warehouseId,
      type,
    },
  );
  const reverse = useInventoryMutation(() => {
    setReverseTarget(null);
    setNote("");
  });

  const columns: ColumnDef<IStockMovement>[] = [
    {
      accessorKey: "occurredAt",
      header: "When",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="text-sm">{formatDateTime(row.original.occurredAt)}</span>
          <span className="text-[11px] text-neutralPrimary-400">#{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge badge={MOVEMENT_TYPE_BADGE[row.original.type]} />
          {row.original.reversedById && (
            <span className="text-[11px] text-neutralPrimary-400">Reversed by #{row.original.reversedById}</span>
          )}
        </div>
      ),
    },
    { accessorKey: "product", header: "Product", cell: ({ row }) => <ProductCell product={row.original.product} /> },
    {
      accessorKey: "warehouse",
      header: "Warehouse / batch",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <WarehouseCell warehouse={row.original.warehouse} />
          {row.original.lot && (
            <span className="font-mono text-[11px] text-neutralPrimary-500">Batch {row.original.lot.lotNumber}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Change",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <QtyDelta value={row.original.quantity} />
          <span className="text-[11px] text-neutralPrimary-400">→ {formatQty(row.original.onHandAfter)} on hand</span>
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <span>{formatTk(row.original.value)}</span>
          <span className="text-[11px] text-neutralPrimary-400">@ {formatTk(row.original.unitCost)}</span>
        </div>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const s = row.original.source;
        if (s.kind === "NONE") return <span className="text-neutralPrimary-300">—</span>;
        return (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[11px] uppercase tracking-wide text-neutralPrimary-400">{SOURCE_LABEL[s.kind]}</span>
            <span className="font-mono text-xs font-semibold text-neutralPrimary-700">
              {s.kind === "REVERSAL" ? `#${s.id}` : (s.number ?? `#${s.id}`)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note / by",
      cell: ({ row }) => (
        <div className="flex max-w-[16rem] flex-col">
          <span className="line-clamp-2 text-xs text-neutralPrimary-600" title={row.original.note ?? ""}>
            {row.original.note ?? "—"}
          </span>
          <span className="text-[11px] text-neutralPrimary-400">{row.original.createdByUser?.name ?? "System"}</span>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => {
        const m = row.original;
        const canReverse = REVERSIBLE_MOVEMENT_TYPES.includes(m.type) && !m.reversedById;
        return canReverse ? (
          <button
            type="button"
            onClick={() => setReverseTarget(m)}
            title="Undo with an opposite movement"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-neutralPrimary-500 hover:bg-neutralPrimary-100 hover:text-neutralPrimary-800"
          >
            <Undo2 size={14} /> Reverse
          </button>
        ) : null;
      },
    },
  ];
  columns.forEach((c) => (c.enableSorting = false));

  const filterKey = `${productId}|${warehouseId}|${type}`;

  return (
    <section className="flex flex-col gap-4">
      <FilterBar>
        <FilterSelect
          label="Product"
          value={productId}
          onChange={setProductId}
          options={[
            { value: "", label: "All products" },
            ...productOptions.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <FilterSelect
          label="Warehouse"
          value={warehouseId}
          onChange={setWarehouseId}
          options={[{ value: "", label: "All warehouses" }, ...warehouses.map((w) => ({ value: String(w.id), label: w.code }))]}
        />
        <FilterSelect label="Type" value={type} onChange={setType} options={movementTypeFilterOptions} />
        {(productId || warehouseId || type) && (
          <button
            type="button"
            onClick={() => {
              setProductId("");
              setWarehouseId("");
              setType("");
            }}
            className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-lg px-3 text-sm font-medium text-neutralPrimary-500 hover:bg-neutralPrimary-100"
          >
            <X size={14} /> Clear
          </button>
        )}
      </FilterBar>

      <CustomTable<IStockMovement>
        key={filterKey}
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        showSearchbar={false}
      />

      <ConfirmModal
        open={!!reverseTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReverseTarget(null);
            setNote("");
          }
        }}
        title={`Reverse movement #${reverseTarget?.id}?`}
        description={
          reverseTarget
            ? `Records an opposite movement of ${reverseTarget.quantity > 0 ? "-" : "+"}${Math.abs(reverseTarget.quantity)} for ${stockItemName(reverseTarget.product)} in ${reverseTarget.warehouse.code}. The original stays in the history.`
            : undefined
        }
        confirmLabel="Reverse"
        variant="warning"
        isPending={reverse.isPending}
        onConfirm={() =>
          reverseTarget &&
          reverse.mutate({
            endpoint: INVENTORY_API.reverseMovement(reverseTarget.id),
            data: note.trim() ? { note: note.trim() } : {},
          })
        }
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, INVENTORY_LIMITS.NOTE_MAX))}
          rows={3}
          placeholder="Why? (optional, kept on the reversal)"
          className="w-full rounded-lg border border-neutralPrimary-300 px-3 py-2 text-sm outline-none focus:border-greenPrimary-500 focus:ring-4 focus:ring-greenPrimary-500/15"
        />
      </ConfirmModal>
    </section>
  );
}
