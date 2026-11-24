"use client";

import React from "react";
import {
  ArrayPath,
  Control,
  FieldValues,
  Path,
  UseFormTrigger,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Package, Plus, Trash2 } from "lucide-react";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import type {
  IStockLevel,
  IStockLot,
} from "@/modules/inventory/types/inventory.types";
import {
  formatQty,
  stockItemKey,
} from "@/modules/inventory/utils/inventory.utils";

/** "0" in a lot select means "no batch". */
export const NO_LOT = "0";
export const lotIdOf = (value?: string | null) =>
  value && value !== NO_LOT ? Number(value) : undefined;

/** `productId` holds a stock-item key: "12", or "12:41" for size 41 of product 12. */
type Line = { productId?: string; lotId?: string | null };

/**
 * Stock item (a product, or one size of a VARIABLE product) + optional batch +
 * quantity lines, shared by transfers and adjustments. Each line shows what
 * the chosen warehouse holds, so the admin sees the numbers they are about to
 * move or correct.
 */
export default function StockLinesEditor<T extends FieldValues>({
  control,
  trigger,
  name,
  amountName,
  amountLabel,
  title,
  description,
  productOptions,
  lots,
  stock,
  warehouseId,
  isLoading,
  error,
  newLine,
}: {
  control: Control<T>;
  trigger: UseFormTrigger<T>;
  name: ArrayPath<T>;
  /** Field inside each line holding the number, e.g. "quantity". */
  amountName: string;
  amountLabel: string;
  title: string;
  description: string;
  productOptions: { id: string; name: string }[];
  lots: IStockLot[];
  /** Keyed by stockItemKey. */
  stock: Map<string, IStockLevel>;
  warehouseId?: number;
  isLoading?: boolean;
  error?: string;
  newLine: Record<string, unknown>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { fields, append, remove } = useFieldArray({ control, name } as any);
  const lines = (useWatch({ control, name: name as unknown as Path<T> }) ?? []) as Line[];

  const lotOptionsFor = (itemKey?: string) => [
    { id: NO_LOT, name: "No batch (untracked)" },
    ...lots
      .filter(
        (lot) =>
          stockItemKey(lot.product.id, lot.product.variantId) === itemKey,
      )
      .map((lot) => {
        const here = lot.warehouses.find((w) => w.warehouse.id === warehouseId)?.onHand ?? 0;
        return {
          id: lot.id,
          name: `${lot.lotNumber}${lot.expiresAt ? ` · exp ${lot.expiresAt}` : ""} · ${here} here`,
        };
      }),
  ];

  return (
    <section className="rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
            <Package size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-neutralPrimary-800">{title}</h3>
            <p className="text-xs text-neutralPrimary-400">{description}</p>
          </div>
        </div>
        <button
          type="button"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => append(newLine as any)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-greenPrimary-300 px-3 py-2 text-sm font-semibold text-greenPrimary-600 hover:bg-greenPrimary-950"
        >
          <Plus size={15} /> Add product
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const line = lines[index] ?? {};
          const level = line.productId ? stock.get(line.productId) : undefined;
          const lot = lotIdOf(line.lotId)
            ? lots.find((l) => l.id === lotIdOf(line.lotId))
            : undefined;
          const lotHere = lot?.warehouses.find((w) => w.warehouse.id === warehouseId)?.onHand ?? 0;
          return (
            <div
              key={field.id}
              className="grid grid-cols-1 items-start gap-x-3 gap-y-7 rounded-lg bg-neutralPrimary-50/70 p-3 pb-7 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto]"
            >
              <SingleSelectSearch
                labelName="Product"
                name={`${name}.${index}.productId` as Path<T>}
                control={control}
                options={productOptions}
                isLoading={isLoading}
                isRequired
              />
              <SingleSelectSearch
                labelName="Batch"
                name={`${name}.${index}.lotId` as Path<T>}
                control={control}
                options={lotOptionsFor(line.productId)}
                isDisabled={!line.productId}
              />
              <InputField
                labelName={amountLabel}
                name={`${name}.${index}.${amountName}` as Path<T>}
                inputType="number"
                control={control}
                trigger={trigger}
                isRequired
              />
              <div className="flex h-full items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-end">
                <span className="whitespace-nowrap pb-3 text-xs text-neutralPrimary-500" title="In the selected warehouse">
                  {warehouseId && line.productId
                    ? lot
                      ? `${formatQty(lotHere)} in batch`
                      : `${formatQty(level?.onHand ?? 0)} on hand · ${formatQty(level?.available ?? 0)} free`
                    : ""}
                </span>
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
      {error && <p className="mt-2 text-xs font-medium text-destructive-500">{error}</p>}
    </section>
  );
}
