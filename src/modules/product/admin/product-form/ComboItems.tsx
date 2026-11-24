"use client";

import { useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { MdAdd, MdDelete } from "react-icons/md";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { useGet } from "@/hooks/api/useGet";
import {
  emptyBundleItem,
  ProductFormData,
} from "@/modules/product/schemas/product.schema";
import { IBundleOption } from "@/modules/product/types/product.types";
import FormSection from "./FormSection";

const formatBDT = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const effective = (price: number, discountPrice: number) =>
  discountPrice > 0 && discountPrice < price ? discountPrice : price;

const STATUS_NOTE: Record<string, string> = {
  DRAFT: " (Draft)",
  INACTIVE: " (Inactive)",
};

type Line = { productId?: string; variantId?: string | null; quantity?: number | null };

// What one line of the combo resolves to today: stock, unit price, sellable.
function resolveLine(line: Line, options: IBundleOption[]) {
  const product = options.find((p) => String(p.id) === line.productId);
  if (!product) return null;
  if (product.type === "VARIABLE") {
    const variant = product.variants.find((v) => String(v.id) === line.variantId);
    if (!variant) return null;
    return {
      stock: variant.quantity,
      unitPrice: effective(variant.price, variant.discountPrice),
      sellable: product.status === "ACTIVE" && variant.status === "ACTIVE",
    };
  }
  return {
    stock: product.quantity,
    unitPrice: effective(product.price, product.discountPrice),
    sellable: product.status === "ACTIVE",
  };
}

function ComboItemRow({
  index,
  options,
  isLoading,
  onRemove,
  removeDisabled,
}: {
  index: number;
  options: IBundleOption[];
  isLoading: boolean;
  onRemove: () => void;
  removeDisabled: boolean;
}) {
  const { control, trigger, setValue } = useFormContext<ProductFormData>();
  const line = useWatch({ control, name: `bundleItems.${index}` });

  const product = options.find((p) => String(p.id) === line?.productId);
  const productOptions = options.map((p) => ({
    id: String(p.id),
    name: `${p.name}${STATUS_NOTE[p.status] ?? ""}`,
  }));
  const sizeOptions =
    product?.variants.map((v) => ({
      id: String(v.id),
      name: `${v.size}${v.status === "INACTIVE" ? " (Inactive)" : ""}`,
    })) ?? [];

  const resolved = line ? resolveLine(line, options) : null;
  const units = Number(line?.quantity) || 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutralPrimary-200 p-4 md:flex-row md:items-start">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_7rem]">
        <SingleSelectSearch
          labelName="Product"
          name={`bundleItems.${index}.productId`}
          control={control}
          options={productOptions}
          isLoading={isLoading}
          isRequired
          // A new product means its sizes no longer apply.
          onSelectionChange={() =>
            setValue(`bundleItems.${index}.variantId`, null, {
              shouldDirty: true,
            })
          }
        />
        <SingleSelectSearch
          labelName="Size"
          name={`bundleItems.${index}.variantId`}
          control={control}
          options={sizeOptions}
          isRequired={product?.type === "VARIABLE"}
          isDisabled={product?.type !== "VARIABLE"}
        />
        <div className="flex flex-col gap-1">
          <InputField
            inlineError
            labelName="Qty"
            name={`bundleItems.${index}.quantity`}
            inputType="number"
            placeholderText="1"
            control={control}
            trigger={trigger}
            isRequired
          />
          {resolved && (
            <p
              className={`pl-0.5 text-xs ${
                !resolved.sellable || resolved.stock < units
                  ? "font-medium text-destructive-500"
                  : "text-neutralPrimary-500"
              }`}
            >
              {resolved.sellable ? `${resolved.stock} in stock` : "Not on sale"}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={removeDisabled}
        aria-label="Remove product from combo"
        title={removeDisabled ? "A combo needs at least one product" : "Remove"}
        className={`flex h-11 w-full shrink-0 items-center justify-center rounded-lg transition-colors md:mt-7 md:w-11 ${
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

// Combo products: what one combo contains. Its stock isn't typed in: it is how
// many complete combos the items' stock allows, and each sale takes the items.
export default function ComboItems({ excludeId }: { excludeId?: number }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bundleItems",
  });
  const watchedLines = useWatch({ control, name: "bundleItems" });

  const { data, isLoading } = useGet<IBundleOption[]>(
    "/products/bundle-options",
    ["getBundleOptions"],
  );
  const options = useMemo(
    () => (data ?? []).filter((p) => p.id !== excludeId),
    [data, excludeId],
  );

  const summary = useMemo(() => {
    const resolved = (watchedLines ?? []).map((line) => ({
      line,
      resolved: resolveLine(line, options),
    }));
    if (!resolved.length || resolved.some((r) => !r.resolved)) return null;
    const combos = Math.min(
      ...resolved.map(({ line, resolved: r }) => {
        const units = Number(line.quantity) || 0;
        return r!.sellable && units > 0 ? Math.floor(r!.stock / units) : 0;
      }),
    );
    const separately = resolved.reduce(
      (sum, { line, resolved: r }) =>
        sum + r!.unitPrice * (Number(line.quantity) || 0),
      0,
    );
    return { combos, separately };
  }, [watchedLines, options]);

  const listError =
    errors.bundleItems?.root?.message ?? errors.bundleItems?.message;

  return (
    <FormSection
      title="Combo products"
      description="Pick single products, or a size of a product that comes in sizes. Selling one combo takes these units from their stock."
    >
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <ComboItemRow
            key={field.id}
            index={index}
            options={options}
            isLoading={isLoading}
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
        onClick={() => append(emptyBundleItem())}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-neutralPrimary-300 bg-white px-4 py-2.5 text-sm font-medium text-neutralPrimary-700 transition-colors hover:bg-neutralPrimary-50"
      >
        <MdAdd fontSize={18} /> Add Product
      </button>

      {summary && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md bg-neutralPrimary-50 px-4 py-3 text-sm text-neutralPrimary-600">
          <span>
            Combos available now:{" "}
            <span className="font-semibold tabular-nums text-neutralPrimary-800">
              {summary.combos}
            </span>
          </span>
          <span>
            Items bought separately:{" "}
            <span className="font-semibold tabular-nums text-neutralPrimary-800">
              {formatBDT(summary.separately)}
            </span>
          </span>
        </div>
      )}
    </FormSection>
  );
}
