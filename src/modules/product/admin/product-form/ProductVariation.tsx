"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { MdAdd, MdDelete } from "react-icons/md";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { fieldBox, fieldLabel } from "@/components/form/formStyles";
import {
  emptyVariant,
  ProductFormData,
  variantSalePrice,
} from "@/modules/product/schemas/product.schema";
import { variantStatus } from "@/modules/product/constants/product-admin.constants";
import FormSection from "./FormSection";

const formatBDT = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

// One size: what customers pick on the product page. Current Price is what
// customers pay: the discount price when it is below the base price.
function VariantRow({
  index,
  onRemove,
  removeDisabled,
}: {
  index: number;
  onRemove: () => void;
  removeDisabled: boolean;
}) {
  const { control, trigger } = useFormContext<ProductFormData>();
  const [price, discountPrice] = useWatch({
    control,
    name: [`variants.${index}.price`, `variants.${index}.discountPrice`],
  });
  const current = variantSalePrice(price, discountPrice);

  return (
    // * Breakpoints are container queries (@xl, @3xl) on the list, not screen
    // * sizes: beside the sticky aside the card is narrow even on a laptop.
    <div className="flex flex-col gap-4 rounded-lg border border-neutralPrimary-200 p-4 @3xl:flex-row @3xl:items-start @3xl:border-0 @3xl:p-0">
      <div className="grid w-full grid-cols-2 gap-4 @xl:grid-cols-3 @3xl:grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr_8.5rem]">
        <InputField
          inlineError
          labelName="Size"
          name={`variants.${index}.size`}
          placeholderText="e.g. 100ml"
          control={control}
          trigger={trigger}
          isRequired
        />
        <InputField
          inlineError
          labelName="Base Price (৳)"
          name={`variants.${index}.price`}
          inputType="number"
          placeholderText="e.g. 450"
          control={control}
          trigger={trigger}
          isRequired
        />
        <InputField
          inlineError
          labelName="Discount Price (৳)"
          name={`variants.${index}.discountPrice`}
          inputType="number"
          placeholderText="e.g. 400"
          control={control}
          trigger={trigger}
        />
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Current Price</span>
          <div
            className={`${fieldBox} bg-neutralPrimary-50 text-sm tabular-nums text-neutralPrimary-700 hover:border-neutralPrimary-300`}
            aria-live="polite"
          >
            {price ? formatBDT(current) : "—"}
          </div>
        </div>
        <InputField
          inlineError
          labelName="Stock"
          name={`variants.${index}.quantity`}
          inputType="number"
          placeholderText="0"
          control={control}
          trigger={trigger}
          isRequired
        />
        <SingleSelectSearch
          labelName="Status"
          name={`variants.${index}.status`}
          control={control}
          options={variantStatus}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={removeDisabled}
        aria-label="Remove size"
        title={
          removeDisabled
            ? "A variable product needs at least one size"
            : "Remove size"
        }
        className={`flex h-11 w-full shrink-0 items-center justify-center rounded-lg transition-colors @3xl:mt-7 @3xl:w-11 ${
          removeDisabled
            ? "cursor-not-allowed bg-neutralPrimary-100 text-neutralPrimary-300"
            : "cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-100"
        }`}
      >
        <MdDelete fontSize={20} />
      </button>
    </div>
  );
}

// Variable products: one row per size, each with its own price and stock.
// Replaces the Pricing and Inventory cards of a simple product.
export default function ProductVariation() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const variants = useWatch({ control, name: "variants" }) ?? [];

  // Finish the last row before starting another.
  const addDisabled = variants.some(
    (v) => !v?.size?.trim() || v?.price == null || v.price <= 0,
  );
  const listError = errors.variants?.root?.message ?? errors.variants?.message;

  return (
    <FormSection
      title="Variation"
      description="One row per size. Leave the discount price empty when a size is not on sale. The first active size is the default: its price shows in the shop grid. Inactive sizes are hidden from the shop but keep their stock."
    >
      <div className="@container flex flex-col gap-5">
        {fields.map((field, index) => (
          <VariantRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            removeDisabled={fields.length === 1}
          />
        ))}
      </div>

      {typeof listError === "string" && (
        <p className="text-sm font-medium text-destructive-500">{listError}</p>
      )}

      <button
        type="button"
        onClick={() => append(emptyVariant())}
        disabled={addDisabled}
        title={
          addDisabled
            ? "Fill in Size and Base Price before adding another size"
            : "Add another size"
        }
        className={`inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
          addDisabled
            ? "cursor-not-allowed border-neutralPrimary-200 bg-neutralPrimary-50 text-neutralPrimary-400"
            : "cursor-pointer border-neutralPrimary-300 bg-white text-neutralPrimary-700 hover:bg-neutralPrimary-50"
        }`}
      >
        <MdAdd fontSize={18} /> Add Variation
      </button>
    </FormSection>
  );
}
