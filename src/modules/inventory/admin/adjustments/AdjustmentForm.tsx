"use client";

import React, { useEffect } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import TextAreaField from "@/components/form/TextAreaField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import ToggleButton from "@/components/form/ToggleButton";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import {
  INVENTORY_API,
  adjustmentReasonOptions,
  adjustmentTypeOptions,
  writeOffReasonOptions,
} from "@/modules/inventory/constants/inventory.constants";
import {
  useInventoryMutation,
  useInventoryOptions,
  useWarehouseStock,
} from "@/modules/inventory/hooks/useInventory";
import {
  AdjustmentFormType,
  adjustmentSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import { splitStockItemKey } from "@/modules/inventory/utils/inventory.utils";
import { Callout, ModalTitle } from "../shared/InventoryUi";
import StockLinesEditor, { lotIdOf } from "../shared/StockLinesEditor";

const NEW_LINE = { productId: "", lotId: null, amount: 0 };

const HELP = {
  STOCK_COUNT: "Type what you counted on the shelf. The difference from the system's number when the count was saved is posted.",
  MANUAL: "Type the correct on-hand number. When posted, the stock is set to exactly that.",
  WRITE_OFF: "Type how many units to remove. A reason is required.",
} as const;

/** Create a stock count, manual correction or write-off (draft or posted at once). */
export default function AdjustmentForm({ onClose }: { onClose: () => void }) {
  const options = useInventoryOptions({ withLots: true });
  const { control, trigger, handleSubmit, formState, setValue } = useForm<AdjustmentFormType>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: "STOCK_COUNT",
      warehouseId: "",
      reason: null,
      notes: "",
      post: false,
      items: [NEW_LINE],
    },
  });
  const type = useWatch({ control, name: "type" });
  const post = useWatch({ control, name: "post" });
  const warehouseId = Number(useWatch({ control, name: "warehouseId" })) || undefined;
  const stock = useWarehouseStock(warehouseId);
  const isWriteOff = type === "WRITE_OFF";

  // A reason picked for another type may not be valid for a write-off.
  useEffect(() => {
    setValue("reason", null);
  }, [type, setValue]);

  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<AdjustmentFormType> = (data) =>
    mutate({
      endpoint: INVENTORY_API.ADJUSTMENTS,
      data: {
        type: data.type,
        warehouseId: Number(data.warehouseId),
        reason: data.reason || undefined,
        notes: data.notes || null,
        post: data.post,
        items: data.items.map((i) => ({
          ...splitStockItemKey(i.productId),
          lotId: lotIdOf(i.lotId),
          ...(isWriteOff ? { quantity: i.amount } : { countedQty: i.amount }),
        })),
      },
    });

  const itemsError = formState.errors.items?.message ?? formState.errors.items?.root?.message;

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle title="New Adjustment" subtitle="Correct the system's stock to match the shelf, or remove units that can't be sold." />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <FormSection icon={<ClipboardCheck size={16} />} title="Adjustment" description={HELP[type as keyof typeof HELP]}>
          <SingleSelectSearch labelName="Type" name="type" control={control} options={adjustmentTypeOptions} isRequired />
          <SingleSelectSearch labelName="Warehouse" name="warehouseId" control={control} options={options.activeWarehouseOptions} isLoading={options.isLoading} isRequired />
          <SingleSelectSearch
            key={type}
            labelName={isWriteOff ? "Reason" : "Reason (optional)"}
            name="reason"
            control={control}
            options={isWriteOff ? writeOffReasonOptions : adjustmentReasonOptions}
            isRequired={isWriteOff}
          />
          <ToggleButton name="post" control={control} label="Post immediately" activeLabel="Stock changes now" inactiveLabel="Save as draft" defaultValue={false} />
        </FormSection>
        {formState.errors.reason?.message && (
          <p className="-mt-3 text-xs font-medium text-destructive-500">{formState.errors.reason.message}</p>
        )}

        <StockLinesEditor<AdjustmentFormType>
          control={control}
          trigger={trigger}
          name="items"
          amountName="amount"
          amountLabel={isWriteOff ? "Units to remove" : "Counted on hand"}
          title="Products"
          description="Numbers on the right show what the system holds in the selected warehouse."
          productOptions={options.productOptions}
          lots={options.lots}
          stock={stock}
          warehouseId={warehouseId}
          isLoading={options.isLoading}
          error={itemsError}
          newLine={NEW_LINE}
        />

        <TextAreaField labelName="Notes" name="notes" placeholderText="e.g. Monthly count, shelves A to D" control={control} trigger={trigger} rowNo={2} />

        {post && (
          <Callout tone="warning">
            Posting changes stock straight away and can only be undone by reversing its movements.
          </Callout>
        )}

        <FormActions onCancel={onClose} submitTitle={post ? "Create & Post" : "Save Draft"} isPending={isPending} />
      </form>
    </section>
  );
}
