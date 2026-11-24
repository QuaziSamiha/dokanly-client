"use client";

import React, { useState } from "react";
import { ArrowRight, Ban, PackageCheck, Truck } from "lucide-react";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import {
  INVENTORY_API,
  TRANSFER_STATUS_BADGE,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryQuery,
} from "@/modules/inventory/hooks/useInventory";
import type { IStockTransfer } from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  formatDateTime,
  formatQty,
} from "@/modules/inventory/utils/inventory.utils";
import {
  ActionButton,
  Callout,
  DetailGrid,
  LinesTable,
  ModalTitle,
  StatusBadge,
} from "../shared/InventoryUi";

/** A transfer with its lines; ship, receive (with per-line counts) or cancel. */
export default function TransferDetail({ transferId }: { transferId: number }) {
  const [confirm, setConfirm] = useState<"ship" | "cancel" | null>(null);
  const [receiving, setReceiving] = useState(false);
  const [received, setReceived] = useState<Record<number, string>>({});

  const { data: tr, isLoading } = useInventoryQuery<IStockTransfer>(
    `${INVENTORY_API.TRANSFERS}/${transferId}`,
  );
  const action = useInventoryMutation(() => {
    setConfirm(null);
    setReceiving(false);
  });

  if (isLoading || !tr) {
    return <div className="p-10 text-center text-sm text-neutralPrimary-400">Loading transfer…</div>;
  }

  const units = tr.items.reduce((s, i) => s + i.quantitySent, 0);
  const lost = tr.items.reduce((s, i) => s + (i.shortfall ?? 0), 0);

  // Only lines that arrived short are sent; the rest count as fully received.
  const receivedFor = (id: number, sent: number) => {
    const raw = received[id];
    const n = raw === undefined || raw === "" ? sent : Number(raw);
    return Number.isFinite(n) ? n : sent;
  };
  const invalid = tr.items.some((i) => {
    const n = receivedFor(i.id, i.quantitySent);
    return !Number.isInteger(n) || n < 0 || n > i.quantitySent;
  });
  const submitReceive = () =>
    action.mutate({
      endpoint: `${INVENTORY_API.TRANSFERS}/${tr.id}/receive`,
      data: {
        items: tr.items
          .filter((i) => receivedFor(i.id, i.quantitySent) !== i.quantitySent)
          .map((i) => ({ transferItemId: i.id, quantityReceived: receivedFor(i.id, i.quantitySent) })),
      },
    });

  return (
    <section className="flex flex-col gap-5 p-4 sm:p-6">
      <ModalTitle
        title={<span className="font-mono">{tr.transferNumber}</span>}
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            {tr.fromWarehouse.code} <ArrowRight size={14} /> {tr.toWarehouse.code}
          </span>
        }
        aside={<StatusBadge badge={TRANSFER_STATUS_BADGE[tr.status]} />}
      />

      <DetailGrid
        items={[
          { label: "From", value: tr.fromWarehouse.name },
          { label: "To", value: tr.toWarehouse.name },
          { label: "Units", value: formatQty(units) },
          { label: "Lost in transit", value: tr.status === "RECEIVED" ? formatQty(lost) : "—" },
          { label: "Created", value: formatDateTime(tr.createdAt) },
          { label: "Shipped", value: formatDateTime(tr.shippedAt) },
          { label: "Received", value: formatDateTime(tr.receivedAt) },
          { label: "Created by", value: tr.createdByUser?.name ?? "—" },
        ]}
      />

      {receiving && (
        <Callout tone="info" icon={<PackageCheck size={16} />}>
          Enter what arrived per line. Anything short is recorded as lost in transit.
        </Callout>
      )}

      <LinesTable
        headers={[
          { label: "Product" },
          { label: "Batch" },
          { label: "Sent", align: "right" },
          { label: receiving ? "Arrived" : "Received", align: "right" },
          { label: "Short", align: "right" },
        ]}
      >
        {tr.items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-medium text-neutralPrimary-800">
              {stockItemName(item.product)}
            </td>
            <td className="px-4 py-3 font-mono text-xs">
              {item.lot?.lotNumber ?? "—"}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatQty(item.quantitySent)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {receiving ? (
                <input
                  type="number"
                  min={0}
                  max={item.quantitySent}
                  value={received[item.id] ?? String(item.quantitySent)}
                  onChange={(e) => setReceived((r) => ({ ...r, [item.id]: e.target.value }))}
                  className="h-9 w-24 rounded-lg border border-neutralPrimary-300 px-2 text-right outline-none focus:border-greenPrimary-500 focus:ring-4 focus:ring-greenPrimary-500/15"
                />
              ) : (
                formatQty(item.quantityReceived)
              )}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {receiving
                ? formatQty(item.quantitySent - receivedFor(item.id, item.quantitySent))
                : item.shortfall
                  ? <span className="font-semibold text-destructive-600">{formatQty(item.shortfall)}</span>
                  : "—"}
            </td>
          </tr>
        ))}
      </LinesTable>

      {tr.notes && <p className="text-sm text-neutralPrimary-500">{tr.notes}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-neutralPrimary-100 pt-4">
        {tr.status === "DRAFT" && (
          <>
            <ActionButton variant="danger" icon={<Ban size={16} />} onClick={() => setConfirm("cancel")}>
              Cancel Transfer
            </ActionButton>
            <ActionButton variant="info" icon={<Truck size={16} />} onClick={() => setConfirm("ship")}>
              Ship Now
            </ActionButton>
          </>
        )}
        {tr.status === "IN_TRANSIT" &&
          (receiving ? (
            <>
              <ActionButton onClick={() => setReceiving(false)}>Back</ActionButton>
              <ActionButton
                variant="primary"
                icon={<PackageCheck size={16} />}
                disabled={invalid}
                isPending={action.isPending}
                onClick={submitReceive}
              >
                Confirm Receipt
              </ActionButton>
            </>
          ) : (
            <ActionButton variant="primary" icon={<PackageCheck size={16} />} onClick={() => setReceiving(true)}>
              Receive at {tr.toWarehouse.code}
            </ActionButton>
          ))}
      </div>

      <ConfirmModal
        open={confirm === "ship"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Ship ${tr.transferNumber}?`}
        description={`${formatQty(units)} units leave ${tr.fromWarehouse.code} now. If it sells to the shop, the shop's stock drops until ${tr.toWarehouse.code} receives them.`}
        confirmLabel="Ship"
        variant="info"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.TRANSFERS}/${tr.id}/ship` })}
      />
      <ConfirmModal
        open={confirm === "cancel"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Cancel ${tr.transferNumber}?`}
        description="The draft is closed. No stock has moved."
        confirmLabel="Cancel Transfer"
        cancelLabel="Keep"
        isPending={action.isPending}
        onConfirm={() => action.mutate({ endpoint: `${INVENTORY_API.TRANSFERS}/${tr.id}/cancel` })}
      />
    </section>
  );
}
