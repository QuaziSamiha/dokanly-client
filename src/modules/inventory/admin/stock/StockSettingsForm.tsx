"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing } from "lucide-react";
import InputField from "@/components/form/InputField";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import { useInventoryMutation } from "@/modules/inventory/hooks/useInventory";
import {
  StockSettingsFormType,
  stockSettingsSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import type { IStockLevel } from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  formatQty,
} from "@/modules/inventory/utils/inventory.utils";
import { DetailGrid, ModalTitle } from "../shared/InventoryUi";

/** Reorder point / quantity / safety stock for one product in one warehouse. */
export default function StockSettingsForm({
  level,
  onClose,
}: {
  level: IStockLevel;
  onClose: () => void;
}) {
  const { control, trigger, handleSubmit } = useForm<StockSettingsFormType>({
    resolver: zodResolver(stockSettingsSchema),
    defaultValues: {
      reorderPoint: level.reorderPoint,
      reorderQty: level.reorderQty,
      safetyStock: level.safetyStock,
    },
  });
  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<StockSettingsFormType> = (data) =>
    mutate({
      method: "patch",
      endpoint: INVENTORY_API.stockSettings(
        level.product.id,
        level.warehouse.id,
        level.product.variantId,
      ),
      // null clears a setting, so the global low-stock threshold applies again
      data: {
        reorderPoint: data.reorderPoint ?? null,
        reorderQty: data.reorderQty ?? null,
        safetyStock: data.safetyStock ?? null,
      },
    });

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title="Reorder Settings"
        subtitle={`${stockItemName(level.product)} in ${level.warehouse.code}`}
      />
      <DetailGrid
        items={[
          { label: "On hand", value: formatQty(level.onHand) },
          { label: "Reserved", value: formatQty(level.reserved) },
          { label: "Available", value: formatQty(level.available) },
          { label: "Incoming", value: formatQty(level.incoming) },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormSection
          icon={<BellRing size={16} />}
          title="Replenishment"
          description="Leave empty to use the default low-stock level of 10. Quantities change only through receipts, transfers and adjustments."
        >
          <InputField labelName="Reorder Point" name="reorderPoint" inputType="number" placeholderText="Suggest buying at this level" control={control} trigger={trigger} />
          <InputField labelName="Reorder Quantity" name="reorderQty" inputType="number" placeholderText="How many to buy" control={control} trigger={trigger} />
          <InputField labelName="Safety Stock" name="safetyStock" inputType="number" placeholderText="Buffer to keep" control={control} trigger={trigger} />
        </FormSection>
        <FormActions onCancel={onClose} submitTitle="Save Settings" isPending={isPending} />
      </form>
    </section>
  );
}
