"use client";

import React from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft } from "lucide-react";
import TextAreaField from "@/components/form/TextAreaField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryOptions,
  useWarehouseStock,
} from "@/modules/inventory/hooks/useInventory";
import {
  TransferFormType,
  transferSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import { splitStockItemKey } from "@/modules/inventory/utils/inventory.utils";
import { ModalTitle } from "../shared/InventoryUi";
import StockLinesEditor, { lotIdOf } from "../shared/StockLinesEditor";

const NEW_LINE = { productId: "", lotId: null, quantity: 1 };

/** Create a draft transfer between two warehouses. */
export default function TransferForm({ onClose }: { onClose: () => void }) {
  const options = useInventoryOptions({ withLots: true });
  const { control, trigger, handleSubmit, formState } = useForm<TransferFormType>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromWarehouseId: "", toWarehouseId: "", notes: "", items: [NEW_LINE] },
  });
  const fromId = Number(useWatch({ control, name: "fromWarehouseId" })) || undefined;
  const stock = useWarehouseStock(fromId);
  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<TransferFormType> = (data) =>
    mutate({
      endpoint: INVENTORY_API.TRANSFERS,
      data: {
        fromWarehouseId: Number(data.fromWarehouseId),
        toWarehouseId: Number(data.toWarehouseId),
        notes: data.notes || null,
        items: data.items.map((i) => ({
          ...splitStockItemKey(i.productId),
          lotId: lotIdOf(i.lotId),
          quantity: i.quantity,
        })),
      },
    });

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title="New Transfer"
        subtitle="Saved as a draft. Stock leaves the source when you ship it and arrives when the destination receives it."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <FormSection icon={<ArrowRightLeft size={16} />} title="Route">
          <SingleSelectSearch labelName="From" name="fromWarehouseId" control={control} options={options.activeWarehouseOptions} isLoading={options.isLoading} isRequired />
          <SingleSelectSearch labelName="To" name="toWarehouseId" control={control} options={options.activeWarehouseOptions} isLoading={options.isLoading} isRequired />
          {formState.errors.toWarehouseId?.message?.includes("different") && (
            <p className="-mt-5 text-xs font-medium text-destructive-500 md:col-span-2">
              {formState.errors.toWarehouseId.message}
            </p>
          )}
        </FormSection>

        <StockLinesEditor<TransferFormType>
          control={control}
          trigger={trigger}
          name="items"
          amountName="quantity"
          amountLabel="Quantity"
          title="Products"
          description="Pick a batch to move a specific one; numbers show what the source holds."
          productOptions={options.productOptions}
          lots={options.lots}
          stock={stock}
          warehouseId={fromId}
          isLoading={options.isLoading}
          error={formState.errors.items?.message ?? formState.errors.items?.root?.message}
          newLine={NEW_LINE}
        />

        <TextAreaField labelName="Notes" name="notes" placeholderText="Why is this stock moving?" control={control} trigger={trigger} rowNo={2} />

        <FormActions onCancel={onClose} submitTitle="Create Draft" isPending={isPending} />
      </form>
    </section>
  );
}
