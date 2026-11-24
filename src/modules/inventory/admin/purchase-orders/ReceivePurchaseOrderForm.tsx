"use client";

import React from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageCheck } from "lucide-react";
import InputField from "@/components/form/InputField";
import DateInputField from "@/components/form/DateInputField";
import { FormActions } from "@/modules/promotion/admin/PromotionFormParts";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import { useInventoryMutation } from "@/modules/inventory/hooks/useInventory";
import {
  ReceivePurchaseOrderFormType,
  receivePurchaseOrderSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import type { IPurchaseOrder } from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  formatQty,
  toDateOnly,
} from "@/modules/inventory/utils/inventory.utils";
import { Callout, ModalTitle } from "../shared/InventoryUi";

/** Book a delivery against a placed purchase order. */
export default function ReceivePurchaseOrderForm({
  purchaseOrder,
  onClose,
}: {
  purchaseOrder: IPurchaseOrder;
  onClose: () => void;
}) {
  const open = purchaseOrder.items.filter((i) => i.quantityOutstanding > 0);

  const { control, trigger, handleSubmit, setError, formState } =
    useForm<ReceivePurchaseOrderFormType>({
      resolver: zodResolver(receivePurchaseOrderSchema),
      defaultValues: {
        supplierInvoiceNo: purchaseOrder.supplierInvoiceNo ?? "",
        note: "",
        items: open.map((i) => ({
          purchaseOrderItemId: i.id,
          outstanding: i.quantityOutstanding,
          // Default to the whole outstanding quantity; edit for a partial delivery.
          quantity: i.quantityOutstanding,
          lotNumber: "",
          manufacturedAt: null,
          expiresAt: null,
        })),
      },
    });
  const values = useWatch({ control });
  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<ReceivePurchaseOrderFormType> = (data) => {
    const items = data.items
      .filter((l) => (l.quantity ?? 0) > 0)
      .map((l) => ({
        purchaseOrderItemId: l.purchaseOrderItemId,
        quantity: l.quantity,
        lotNumber: l.lotNumber || undefined,
        manufacturedAt: l.lotNumber ? toDateOnly(l.manufacturedAt) : undefined,
        expiresAt: l.lotNumber ? toDateOnly(l.expiresAt) : undefined,
      }));
    if (!items.length) {
      setError("items", { message: "Enter a received quantity on at least one line" });
      return;
    }
    mutate({
      endpoint: `${INVENTORY_API.PURCHASE_ORDERS}/${purchaseOrder.id}/receive`,
      data: {
        items,
        supplierInvoiceNo: data.supplierInvoiceNo || undefined,
        note: data.note || undefined,
      },
    });
  };

  const units = (values.items ?? []).reduce((s, l) => s + (Number(l?.quantity) || 0), 0);

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title={`Receive ${purchaseOrder.poNumber}`}
        subtitle={`Into ${purchaseOrder.warehouse.code} · ${purchaseOrder.warehouse.name}`}
      />
      <Callout tone="info" icon={<PackageCheck size={16} />}>
        Enter what actually arrived. Lines can be received over several deliveries. Add a batch
        number to track expiry; an existing batch number of the same product is reused.
      </Callout>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {open.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-neutralPrimary-200 bg-white p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-neutralPrimary-800">
                {stockItemName(item.product)}
              </p>
              <p className="text-xs text-neutralPrimary-500">
                Ordered {formatQty(item.quantityOrdered)} · received {formatQty(item.quantityReceived)} ·{" "}
                <b className="text-neutralPrimary-700">{formatQty(item.quantityOutstanding)} outstanding</b>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-x-3 gap-y-7 pb-5 sm:grid-cols-2 lg:grid-cols-4">
              <InputField labelName="Received Now" name={`items.${index}.quantity`} inputType="number" control={control} trigger={trigger} />
              <InputField labelName="Batch Number" name={`items.${index}.lotNumber`} placeholderText="Optional" control={control} trigger={trigger} />
              <DateInputField label="Manufactured" name={`items.${index}.manufacturedAt`} control={control} placeholder="Optional" disabled={!values.items?.[index]?.lotNumber} />
              <DateInputField label="Expires" name={`items.${index}.expiresAt`} control={control} placeholder="Optional" disabled={!values.items?.[index]?.lotNumber} />
            </div>
          </div>
        ))}
        {formState.errors.items?.message && (
          <p className="text-xs font-medium text-destructive-500">{formState.errors.items.message}</p>
        )}

        <div className="grid grid-cols-1 gap-x-3 gap-y-7 pb-4 sm:grid-cols-2">
          <InputField labelName="Supplier Invoice No." name="supplierInvoiceNo" placeholderText="Optional" control={control} trigger={trigger} />
          <InputField labelName="Note" name="note" placeholderText="e.g. Two cartons dented" control={control} trigger={trigger} />
        </div>

        <FormActions onCancel={onClose} submitTitle={`Receive ${formatQty(units)} units`} isPending={isPending} />
      </form>
    </section>
  );
}
