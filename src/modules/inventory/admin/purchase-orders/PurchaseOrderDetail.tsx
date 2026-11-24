"use client";

import React, { useState } from "react";
import { Ban, PackageCheck, Pencil, Send } from "lucide-react";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import {
  INVENTORY_API,
  PO_STATUS_BADGE,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IPurchaseOrder } from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  formatDate,
  formatDateTime,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import {
  ActionButton,
  DetailGrid,
  LinesTable,
  ModalTitle,
  StatusBadge,
} from "../shared/InventoryUi";

type Props = {
  purchaseOrderId: number;
  onEdit: (po: IPurchaseOrder) => void;
  onReceive: (po: IPurchaseOrder) => void;
};

/** A purchase order with its lines and the actions its status allows. */
export default function PurchaseOrderDetail({ purchaseOrderId, onEdit, onReceive }: Props) {
  const [confirm, setConfirm] = useState<"place" | "cancel" | null>(null);
  const { data: po, isLoading } = useInventoryQuery<IPurchaseOrder>(
    `${INVENTORY_API.PURCHASE_ORDERS}/${purchaseOrderId}`,
  );
  const action = useInventoryMutation(() => setConfirm(null));

  if (isLoading || !po) {
    return <div className="p-10 text-center text-sm text-neutralPrimary-400">Loading purchase order…</div>;
  }

  const nothingReceived = po.items.every((i) => i.quantityReceived === 0);
  const canEdit = po.status === "DRAFT";
  const canPlace = po.status === "DRAFT";
  const canReceive = po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED";
  const canCancel = (po.status === "DRAFT" || po.status === "ORDERED") && nothingReceived;
  const ordered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
  const received = po.items.reduce((s, i) => s + i.quantityReceived, 0);

  return (
    <section className="flex flex-col gap-5 p-4 sm:p-6">
      <ModalTitle
        title={<span className="font-mono">{po.poNumber}</span>}
        subtitle={`${po.supplier.name} → ${po.warehouse.code}`}
        aside={<StatusBadge badge={PO_STATUS_BADGE[po.status]} />}
      />

      <DetailGrid
        items={[
          { label: "Supplier", value: `${po.supplier.code} · ${po.supplier.name}` },
          { label: "Deliver to", value: `${po.warehouse.code} · ${po.warehouse.name}` },
          { label: "Expected", value: formatDate(po.expectedAt) },
          { label: "Invoice", value: po.supplierInvoiceNo ?? "—" },
          { label: "Placed", value: formatDateTime(po.orderedAt) },
          { label: "Fully received", value: formatDateTime(po.receivedAt) },
          { label: "Received", value: `${formatQty(received)} / ${formatQty(ordered)} units` },
          { label: "Created by", value: po.createdByUser?.name ?? "—" },
        ]}
      />

      <LinesTable
        headers={[
          { label: "Product" },
          { label: "Ordered", align: "right" },
          { label: "Received", align: "right" },
          { label: "Outstanding", align: "right" },
          { label: "Unit cost", align: "right" },
          { label: "Line total", align: "right" },
        ]}
      >
        {po.items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">
              <p className="font-medium text-neutralPrimary-800">
                {stockItemName(item.product)}
              </p>
              <p className="text-xs text-neutralPrimary-400">
                {item.product.sku ?? `#${item.product.id}`}
              </p>
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatQty(item.quantityOrdered)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-success-600">
              {formatQty(item.quantityReceived)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{formatQty(item.quantityOrdered)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-success-600">{formatQty(item.quantityReceived)}</td>
            <td className="px-4 py-3 text-right tabular-nums">
              {item.quantityOutstanding ? (
                <span className="font-semibold text-warningPrimary-700">{formatQty(item.quantityOutstanding)}</span>
              ) : (
                <span className="text-neutralPrimary-300">0</span>
              )}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{formatTk(item.unitCost)}</td>
            <td className="px-4 py-3 text-right font-medium tabular-nums">{formatTk(item.lineTotal)}</td>
          </tr>
        ))}
      </LinesTable>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-md text-sm text-neutralPrimary-500">{po.notes ?? ""}</p>
        <dl className="grid min-w-[16rem] grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-neutralPrimary-500">Subtotal</dt>
          <dd className="text-right tabular-nums">{formatTk(po.subtotal)}</dd>
          <dt className="text-neutralPrimary-500">Shipping</dt>
          <dd className="text-right tabular-nums">{formatTk(po.shippingCost)}</dd>
          <dt className="text-neutralPrimary-500">Duty & other</dt>
          <dd className="text-right tabular-nums">{formatTk(po.otherCost)}</dd>
          <dt className="border-t border-neutralPrimary-200 pt-1 font-semibold">Total</dt>
          <dd className="border-t border-neutralPrimary-200 pt-1 text-right font-bold tabular-nums text-greenPrimary-700">
            {formatTk(po.total)}
          </dd>
        </dl>
      </div>

      {(canEdit || canPlace || canReceive || canCancel) && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-neutralPrimary-100 pt-4">
          {canCancel && (
            <ActionButton variant="danger" icon={<Ban size={16} />} onClick={() => setConfirm("cancel")}>
              Cancel Order
            </ActionButton>
          )}
          {canEdit && (
            <ActionButton icon={<Pencil size={16} />} onClick={() => onEdit(po)}>
              Edit
            </ActionButton>
          )}
          {canPlace && (
            <ActionButton variant="info" icon={<Send size={16} />} onClick={() => setConfirm("place")}>
              Place Order
            </ActionButton>
          )}
          {canReceive && (
            <ActionButton variant="primary" icon={<PackageCheck size={16} />} onClick={() => onReceive(po)}>
              Receive Goods
            </ActionButton>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirm === "place"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Place ${po.poNumber}?`}
        description="Marks the order as sent to the supplier. The ordered units show as incoming until they are received. The order can no longer be edited."
        confirmLabel="Place Order"
        variant="info"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.PURCHASE_ORDERS}/${po.id}/place` })}
      />
      <ConfirmModal
        open={confirm === "cancel"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Cancel ${po.poNumber}?`}
        description="The order is closed and any incoming units are released. This can't be undone."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.PURCHASE_ORDERS}/${po.id}/cancel` })}
      />
    </section>
  );
}
