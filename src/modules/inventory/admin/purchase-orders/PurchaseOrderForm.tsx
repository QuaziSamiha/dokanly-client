"use client";

import React from "react";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Package, Plus, Receipt, Trash2 } from "lucide-react";
import InputField from "@/components/form/InputField";
import TextAreaField from "@/components/form/TextAreaField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import DateInputField from "@/components/form/DateInputField";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryOptions,
} from "@/modules/inventory/hooks/useInventory";
import {
  PurchaseOrderFormType,
  purchaseOrderSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import type { IPurchaseOrder } from "@/modules/inventory/types/inventory.types";
import {
  formatTk,
  toDateOnly,
  splitStockItemKey,
  stockItemKey,
  toPickerDate,
} from "@/modules/inventory/utils/inventory.utils";
import { ModalTitle } from "../shared/InventoryUi";

const EMPTY_LINE = { productId: "", quantityOrdered: 1, unitCost: 0 };

/** Create a purchase order (DRAFT) or edit a draft. */
export default function PurchaseOrderForm({
  purchaseOrder,
  onClose,
}: {
  purchaseOrder?: IPurchaseOrder;
  onClose: () => void;
}) {
  const isEdit = !!purchaseOrder;
  const options = useInventoryOptions();

  const { control, trigger, handleSubmit, formState } =
    useForm<PurchaseOrderFormType>({
      resolver: zodResolver(purchaseOrderSchema),
      defaultValues: purchaseOrder
        ? {
            supplierId: String(purchaseOrder.supplier.id),
            warehouseId: String(purchaseOrder.warehouse.id),
            expectedAt: toPickerDate(purchaseOrder.expectedAt) ?? null,
            supplierInvoiceNo: purchaseOrder.supplierInvoiceNo ?? "",
            shippingCost: purchaseOrder.shippingCost,
            otherCost: purchaseOrder.otherCost,
            notes: purchaseOrder.notes ?? "",
            items: purchaseOrder.items.map((i) => ({
              productId: stockItemKey(i.product.id, i.product.variantId),
              quantityOrdered: i.quantityOrdered,
              unitCost: i.unitCost,
            })),
          }
        : {
            supplierId: "",
            warehouseId: "",
            expectedAt: null,
            supplierInvoiceNo: "",
            shippingCost: 0,
            otherCost: 0,
            notes: "",
            items: [EMPTY_LINE],
          },
    });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = useWatch({ control });

  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<PurchaseOrderFormType> = (data) => {
    const payload = {
      supplierId: Number(data.supplierId),
      warehouseId: Number(data.warehouseId),
      expectedAt: toDateOnly(data.expectedAt) ?? null,
      supplierInvoiceNo: data.supplierInvoiceNo || null,
      shippingCost: data.shippingCost ?? 0,
      otherCost: data.otherCost ?? 0,
      notes: data.notes || null,
      items: data.items.map((i) => ({
        ...splitStockItemKey(i.productId),
        quantityOrdered: i.quantityOrdered,
        unitCost: i.unitCost,
      })),
    };
    mutate(
      isEdit
        ? { method: "patch", endpoint: `${INVENTORY_API.PURCHASE_ORDERS}/${purchaseOrder.id}`, data: payload }
        : { endpoint: INVENTORY_API.PURCHASE_ORDERS, data: payload },
    );
  };

  const subtotal = (values.items ?? []).reduce(
    (sum, i) => sum + (Number(i?.quantityOrdered) || 0) * (Number(i?.unitCost) || 0),
    0,
  );
  const total = subtotal + (Number(values.shippingCost) || 0) + (Number(values.otherCost) || 0);
  const itemsError =
    formState.errors.items?.message ?? formState.errors.items?.root?.message;

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title={isEdit ? `Edit ${purchaseOrder.poNumber}` : "New Purchase Order"}
        subtitle="Saved as a draft. Place it when it has been sent to the supplier; stock arrives when you receive it."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <FormSection icon={<ClipboardList size={16} />} title="Order">
          <SingleSelectSearch labelName="Supplier" name="supplierId" control={control} options={options.supplierOptions} isLoading={options.isLoading} isRequired />
          <SingleSelectSearch labelName="Deliver To" name="warehouseId" control={control} options={options.activeWarehouseOptions} isLoading={options.isLoading} isRequired />
          <DateInputField label="Expected Delivery" name="expectedAt" control={control} placeholder="Pick a date" />
          <InputField labelName="Supplier Invoice No." name="supplierInvoiceNo" placeholderText="Optional" control={control} trigger={trigger} />
        </FormSection>

        <section className="rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
                <Package size={16} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-neutralPrimary-800">Products</h3>
                <p className="text-xs text-neutralPrimary-400">Supplier price per unit, before shipping and charges.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => append(EMPTY_LINE)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-greenPrimary-300 px-3 py-2 text-sm font-semibold text-greenPrimary-600 hover:bg-greenPrimary-950"
            >
              <Plus size={15} /> Add product
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => {
              const line = values.items?.[index];
              const lineTotal = (Number(line?.quantityOrdered) || 0) * (Number(line?.unitCost) || 0);
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 items-start gap-x-3 gap-y-7 rounded-lg bg-neutralPrimary-50/70 p-3 pb-7 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <SingleSelectSearch labelName="Product" name={`items.${index}.productId`} control={control} options={options.productOptions} isLoading={options.isLoading} isRequired />
                  <InputField labelName="Quantity" name={`items.${index}.quantityOrdered`} inputType="number" control={control} trigger={trigger} isRequired />
                  <InputField labelName="Unit Cost (Tk)" name={`items.${index}.unitCost`} inputType="number" control={control} trigger={trigger} isRequired />
                  <div className="flex h-full items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-end">
                    <span className="whitespace-nowrap pb-3 text-sm font-semibold tabular-nums text-neutralPrimary-700">{formatTk(lineTotal)}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      title="Remove line"
                      className="mb-2.5 cursor-pointer rounded-md p-1.5 text-neutralPrimary-400 hover:bg-destructive-50 hover:text-destructive-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {itemsError && <p className="mt-2 text-xs font-medium text-destructive-500">{itemsError}</p>}
        </section>

        <FormSection
          icon={<Receipt size={16} />}
          title="Charges"
          description="Spread over the lines by value into the landed unit cost when goods are received."
        >
          <InputField labelName="Shipping (Tk)" name="shippingCost" inputType="number" control={control} trigger={trigger} />
          <InputField labelName="Duty, VAT & Other (Tk)" name="otherCost" inputType="number" control={control} trigger={trigger} />
          <div className="md:col-span-2">
            <TextAreaField labelName="Notes" name="notes" placeholderText="Delivery instructions, payment terms..." control={control} trigger={trigger} rowNo={2} />
          </div>
        </FormSection>

        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 rounded-xl bg-greenPrimary-950/60 px-4 py-3 text-sm">
          <span className="text-neutralPrimary-500">Subtotal <b className="text-neutralPrimary-800">{formatTk(subtotal)}</b></span>
          <span className="text-neutralPrimary-500">Total <b className="text-lg text-greenPrimary-700">{formatTk(total)}</b></span>
        </div>

        <FormActions onCancel={onClose} submitTitle={isEdit ? "Save Draft" : "Create Draft"} isPending={isPending} />
      </form>
    </section>
  );
}
