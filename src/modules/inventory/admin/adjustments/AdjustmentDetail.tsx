"use client";

import React, { useState } from "react";
import { Ban, CheckCheck } from "lucide-react";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import {
  ADJUSTMENT_REASON_LABEL,
  ADJUSTMENT_TYPE_LABEL,
  DOCUMENT_STATUS_BADGE,
  INVENTORY_API,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockAdjustment } from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  formatDateTime,
  formatQty,
} from "@/modules/inventory/utils/inventory.utils";
import {
  ActionButton,
  DetailGrid,
  LinesTable,
  ModalTitle,
  QtyDelta,
  StatusBadge,
} from "../shared/InventoryUi";

/** An adjustment with its lines; a draft can be posted or cancelled. */
export default function AdjustmentDetail({ adjustmentId }: { adjustmentId: number }) {
  const [confirm, setConfirm] = useState<"post" | "cancel" | null>(null);
  const { data: adj, isLoading } = useInventoryQuery<IStockAdjustment>(
    `${INVENTORY_API.ADJUSTMENTS}/${adjustmentId}`,
  );
  const action = useInventoryMutation(() => setConfirm(null));

  if (isLoading || !adj) {
    return <div className="p-10 text-center text-sm text-neutralPrimary-400">Loading adjustment…</div>;
  }

  const isDraft = adj.status === "DRAFT";

  return (
    <section className="flex flex-col gap-5 p-4 sm:p-6">
      <ModalTitle
        title={<span className="font-mono">{adj.adjustmentNumber}</span>}
        subtitle={`${ADJUSTMENT_TYPE_LABEL[adj.type]} in ${adj.warehouse.code}`}
        aside={<StatusBadge badge={DOCUMENT_STATUS_BADGE[adj.status]} />}
      />

      <DetailGrid
        items={[
          { label: "Warehouse", value: `${adj.warehouse.code} · ${adj.warehouse.name}` },
          { label: "Reason", value: adj.reason ? ADJUSTMENT_REASON_LABEL[adj.reason] : "—" },
          { label: "Net change", value: <QtyDelta value={adj.netChange} /> },
          { label: "Lines", value: adj.items.length },
          { label: "Created", value: formatDateTime(adj.createdAt) },
          { label: "Created by", value: adj.createdByUser?.name ?? "—" },
          { label: "Posted", value: formatDateTime(adj.postedAt) },
          { label: "Posted by", value: adj.postedByUser?.name ?? "—" },
        ]}
      />

      <LinesTable
        headers={[
          { label: "Product" },
          { label: "Batch" },
          { label: "Expected", align: "right" },
          { label: "After", align: "right" },
          { label: "Change", align: "right" },
          { label: "Reason" },
        ]}
      >
        {adj.items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-medium text-neutralPrimary-800">
              {stockItemName(item.product)}
            </td>
            <td className="px-4 py-3 font-mono text-xs">
              {item.lot?.lotNumber ?? "—"}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatQty(item.expectedQty)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatQty(item.countedQty)}
            </td>
            <td className="px-4 py-3 text-right">
              <QtyDelta value={item.difference} />
            </td>
            <td className="px-4 py-3 text-xs text-neutralPrimary-500">
              {item.reason ? ADJUSTMENT_REASON_LABEL[item.reason] : "—"}
            </td>
          </tr>
        ))}
      </LinesTable>

      {adj.notes && <p className="text-sm text-neutralPrimary-500">{adj.notes}</p>}
      {isDraft && adj.type === "MANUAL" && (
        <p className="text-xs text-neutralPrimary-400">
          A manual adjustment sets the on-hand to the &quot;After&quot; number as it is when posted; the change may differ if stock moved since.
        </p>
      )}

      {isDraft && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-neutralPrimary-100 pt-4">
          <ActionButton variant="danger" icon={<Ban size={16} />} onClick={() => setConfirm("cancel")}>
            Cancel Draft
          </ActionButton>
          <ActionButton variant="primary" icon={<CheckCheck size={16} />} onClick={() => setConfirm("post")}>
            Post Adjustment
          </ActionButton>
        </div>
      )}

      <ConfirmModal
        open={confirm === "post"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Post ${adj.adjustmentNumber}?`}
        description="The stock changes now. To undo it later, reverse its movements in the stock history."
        confirmLabel="Post"
        variant="info"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.ADJUSTMENTS}/${adj.id}/post` })}
      />
      <ConfirmModal
        open={confirm === "cancel"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Cancel ${adj.adjustmentNumber}?`}
        description="The draft is closed without changing stock."
        confirmLabel="Cancel Draft"
        cancelLabel="Keep"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.ADJUSTMENTS}/${adj.id}/cancel` })}
      />
    </section>
  );
}
