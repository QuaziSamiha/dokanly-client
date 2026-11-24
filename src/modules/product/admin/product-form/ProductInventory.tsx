"use client";

import { useFormContext } from "react-hook-form";
import InputField from "@/components/form/InputField";
import { ProductFormData } from "@/modules/product/schemas/product.schema";
import FormSection from "./FormSection";

export default function ProductInventory({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { control, trigger } = useFormContext<ProductFormData>();

  return (
    <FormSection
      title="Inventory & packaging"
      description="Stock of 10 units or fewer shows as low stock; 0 shows as out of stock."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          inlineError
          labelName="Quantity in Stock"
          name="quantity"
          inputType="number"
          placeholderText="0"
          control={control}
          trigger={trigger}
          isRequired
          isLoading={isLoading}
        />
        {/* Pack size as printed on the label: 190 means 190 g or 190 ml. */}
        <InputField
          inlineError
          labelName="Pack Size (ml)"
          name="size"
          inputType="number"
          placeholderText="e.g. 190"
          control={control}
          trigger={trigger}
          isRequired
          isLoading={isLoading}
        />
      </div>
    </FormSection>
  );
}
