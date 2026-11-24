"use client";

import React from "react";
import { Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { IOrderItem } from "@/modules/order/types/order.types";
import { formatBDT } from "@/modules/order/utils/order.utils";
import { ItemThumb } from "../order.columns";

interface IProps {
  items: IOrderItem[];
  quantities: Record<number, number>;
  removed: number[];
  /** Units that can still be added per product (current shop stock); undefined while loading. */
  stockByProductId?: Record<number, number>;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  onRestore: (itemId: number) => void;
  /** Read-only: a cancelled order's items can't be changed. */
  locked?: boolean;
}

const STEP =
  "flex h-9 w-9 cursor-pointer items-center justify-center text-neutralPrimary-700 transition-colors hover:bg-neutralPrimary-100 disabled:cursor-not-allowed disabled:text-neutralPrimary-300 disabled:hover:bg-transparent";

export default function EditOrderItems({
  items,
  quantities,
  removed,
  stockByProductId,
  onQuantityChange,
  onRemove,
  onRestore,
  locked = false,
}: IProps) {
  const remaining = items.filter((item) => !removed.includes(item.id)).length;

  return (
    <ul className="divide-y divide-neutralPrimary-100">
      {items.map((item) => {
        const isRemoved = removed.includes(item.id);
        const original = Number(item.quantity);
        const quantity = quantities[item.id] ?? original;
        const changed = !isRemoved && quantity !== original;
        // * Stock already reserved by this order can be reused; more needs shop stock.
        const stock = item.productId != null ? stockByProductId?.[item.productId] : undefined;
        const max = stock === undefined ? undefined : original + stock;
        const atMax = max !== undefined && quantity >= max;
        const isLast = remaining === 1 && !isRemoved;

        return (
          <li
            key={item.id}
            className={`grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-3 transition-opacity sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:items-center ${
              isRemoved ? "opacity-60" : ""
            }`}
          >
            <ItemThumb item={item} size={48} />

            <div className="min-w-0">
              <p
                className={`line-clamp-2 text-sm font-medium text-neutralPrimary-800 ${isRemoved ? "line-through" : ""}`}
              >
                {item.productName}
              </p>
              <p className="text-xs text-neutralPrimary-500">
                {formatBDT(item.price)} each
                {item.sku && <span className="font-mono"> · {item.sku}</span>}
              </p>
              {locked ? null : isRemoved ? (
                <p className="mt-0.5 text-xs font-medium text-rose-600">
                  Will be removed · {original} unit{original === 1 ? "" : "s"} go back to stock
                </p>
              ) : changed ? (
                <p className="mt-0.5 text-xs font-medium text-amber-700">
                  Was {original} · {quantity > original ? `takes ${quantity - original} more from stock` : `returns ${original - quantity} to stock`}
                </p>
              ) : stock !== undefined && stock <= 5 ? (
                <p className="mt-0.5 text-xs text-neutralPrimary-500">{stock} more in stock</p>
              ) : null}
            </div>

            <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
              {locked ? (
                <>
                  <span className="text-sm text-neutralPrimary-500 tabular-nums">× {original}</span>
                  <span className="w-20 text-right text-sm font-semibold tabular-nums text-neutralPrimary-800">
                    {formatBDT(Number(item.price) * original)}
                  </span>
                </>
              ) : isRemoved ? (
                <button
                  type="button"
                  onClick={() => onRestore(item.id)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutralPrimary-300 px-3 py-1.5 text-sm font-medium text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50"
                >
                  <RotateCcw size={14} />
                  Undo
                </button>
              ) : (
                <>
                  <div
                    className={`inline-flex items-center overflow-hidden rounded-lg border bg-white ${
                      changed ? "border-amber-400" : "border-neutralPrimary-300"
                    }`}
                    role="group"
                    aria-label={`Quantity of ${item.productName}`}
                  >
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className={STEP}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, quantity + 1)}
                      disabled={atMax}
                      aria-label="Increase quantity"
                      title={atMax ? "No more in stock" : undefined}
                      className={STEP}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="w-20 text-right text-sm font-semibold tabular-nums text-neutralPrimary-800">
                    {formatBDT(Number(item.price) * quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={isLast}
                    aria-label={`Remove ${item.productName}`}
                    title={isLast ? "An order needs at least one item. Cancel the order instead." : "Remove item"}
                    className="cursor-pointer rounded-lg p-2 text-neutralPrimary-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutralPrimary-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
