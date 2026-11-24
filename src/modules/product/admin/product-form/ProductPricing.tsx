"use client";

import { useFormContext, useWatch } from "react-hook-form";
import InputField from "@/components/form/InputField";
import { ProductFormData } from "@/modules/product/schemas/product.schema";
import FormSection from "./FormSection";

const formatBDT = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

export default function ProductPricing({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { control, trigger } = useFormContext<ProductFormData>();
  const [price, discountPrice] = useWatch({
    control,
    name: ["price", "discountPrice"],
  });

  const hasPrice = typeof price === "number" && price > 0;
  const hasDiscount =
    hasPrice &&
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < price;

  return (
    <FormSection
      title="Pricing"
      description="Leave the discount price empty when the product is not on sale."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          inlineError
          labelName="Selling Price (৳)"
          name="price"
          inputType="number"
          placeholderText="0"
          control={control}
          trigger={trigger}
          isRequired
          isLoading={isLoading}
        />
        <InputField
          inlineError
          labelName="Discount Price (৳)"
          name="discountPrice"
          inputType="number"
          placeholderText="0"
          control={control}
          trigger={trigger}
          isLoading={isLoading}
        />
      </div>

      {hasPrice && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-neutralPrimary-50 px-4 py-3 text-sm text-neutralPrimary-600">
          <span>Customers pay</span>
          <span className="font-semibold tabular-nums text-neutralPrimary-800">
            {formatBDT(hasDiscount ? discountPrice : price)}
          </span>
          {hasDiscount && (
            <>
              <span className="tabular-nums text-neutralPrimary-400 line-through">
                {formatBDT(price)}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {Math.round(((price - discountPrice) / price) * 100)}% off
              </span>
            </>
          )}
        </div>
      )}
    </FormSection>
  );
}
