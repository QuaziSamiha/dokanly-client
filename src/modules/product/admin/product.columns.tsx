"use client";

import CustomTooltip from "@/components/primitives/CustomTooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IProduct } from "@/modules/product/types/product.types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import React from "react";
import { IconType } from "react-icons";
import {
  LuBox,
  LuChevronDown,
  LuImage,
  LuLayers,
  LuPackageOpen,
  LuStar,
} from "react-icons/lu";

const BADGE_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset";

export const PRODUCT_STATUS: Record<
  IProduct["status"],
  { label: string; badge: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    label: "Draft",
    badge: "text-sky-700 bg-sky-50 ring-sky-600/20",
    dot: "bg-sky-500",
  },
  INACTIVE: {
    label: "Inactive",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
    dot: "bg-neutralPrimary-400",
  },
};

export const STOCK_STATUS: Record<
  IProduct["stockStatus"],
  { label: string; badge: string; dot: string }
> = {
  IN_STOCK: {
    label: "In stock",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  LOW_STOCK: {
    label: "Low stock",
    badge: "text-amber-700 bg-amber-50 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  OUT_OF_STOCK: {
    label: "Out of stock",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
};

// Prices can arrive as Decimal strings, so coerce before formatting.
const formatBDT = (value: number | string) =>
  `৳${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const primaryImage = (product: IProduct) =>
  product.images?.find((image) => image.isPrimary) ?? product.images?.[0];

export const PRODUCT_TYPE: Record<
  IProduct["type"],
  { label: string; badge: string; icon: IconType }
> = {
  SIMPLE: {
    label: "Simple",
    badge: "text-neutralPrimary-700 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
    icon: LuBox,
  },
  VARIABLE: {
    label: "Variable",
    badge: "text-violet-700 bg-violet-50 ring-violet-600/20",
    icon: LuLayers,
  },
  COMBO: {
    label: "Combo",
    badge: "text-indigo-700 bg-indigo-50 ring-indigo-600/20",
    icon: LuPackageOpen,
  },
};

type Priced = {
  price: number | string;
  discountPrice?: number | string | null;
};

// 0 means "no discount"; the server rejects a discount at or above the price.
const pricingOf = (item: Priced) => {
  const price = Number(item.price) || 0;
  const discount = Number(item.discountPrice) || 0;
  const hasDiscount = discount > 0 && discount < price;
  return { price, selling: hasDiscount ? discount : price, hasDiscount };
};

const SinglePrice = ({ item }: { item: Priced }) => {
  const { price, selling, hasDiscount } = pricingOf(item);
  return (
    <div className="flex flex-col whitespace-nowrap tabular-nums">
      <span className="text-sm font-semibold text-neutralPrimary-800">
        {formatBDT(selling)}
      </span>
      {hasDiscount && (
        <span className="text-xs text-neutralPrimary-400 line-through">
          {formatBDT(price)}
        </span>
      )}
    </div>
  );
};

/**
 * VARIABLE: the selling-price range of the sizes the shop sells (e.g.
 * "৳330 – ৳450"), with a "3 sizes" toggle that lists each size's price.
 * Inactive sizes are listed but left out of the range.
 */
const VariablePrice = ({ product }: { product: IProduct }) => {
  const sizes = product.variants ?? [];
  if (sizes.length === 0) return <SinglePrice item={product} />;

  const active = sizes.filter((v) => v.status !== "INACTIVE");
  const selling = (active.length ? active : sizes).map(
    (v) => pricingOf(v).selling,
  );
  const min = Math.min(...selling);
  const max = Math.max(...selling);
  const anyDiscount = active.some((v) => pricingOf(v).hasDiscount);

  return (
    <div className="flex flex-col items-start whitespace-nowrap tabular-nums">
      <span className="text-sm font-semibold text-neutralPrimary-800">
        {min === max ? formatBDT(min) : `${formatBDT(min)} – ${formatBDT(max)}`}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-violet-700 hover:underline"
          >
            {sizes.length} {sizes.length === 1 ? "size" : "sizes"}
            {anyDiscount && (
              <span className="text-neutralPrimary-500 font-normal">
                {" "}
                · on sale
              </span>
            )}
            <LuChevronDown className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="border-b border-neutralPrimary-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutralPrimary-500">
            Price by size
          </div>
          <ul className="divide-y divide-neutralPrimary-100">
            {sizes.map((v) => {
              const p = pricingOf(v);
              const inactive = v.status === "INACTIVE";
              return (
                <li
                  key={v.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-sm tabular-nums ${inactive ? "opacity-50" : ""}`}
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-neutralPrimary-800">
                      {v.size}
                    </span>
                    <span className="text-xs text-neutralPrimary-500">
                      {inactive ? "Inactive" : `${v.quantity.toLocaleString()} in stock`}
                    </span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="font-semibold text-neutralPrimary-800">
                      {formatBDT(p.selling)}
                    </span>
                    {p.hasDiscount && (
                      <span className="text-xs text-neutralPrimary-400 line-through">
                        {formatBDT(p.price)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const productColumns = (
  handleView: (data: IProduct) => void,
  handleEdit: (data: IProduct) => void,
  // Delete (soft delete / archive) is switched off until there is a business
  // policy for it; pass a handler again to bring the button back.
  handleDelete?: (data: IProduct) => void,
): ColumnDef<IProduct>[] => [
  {
    accessorKey: "name",
    header: "Product",
    enableSorting: false,
    cell: ({ row }) => {
      const product = row.original;
      const image = primaryImage(product);
      const meta = [product.sku].filter(Boolean);

      return (
        <div className="flex min-w-[240px] items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutralPrimary-200 bg-neutralPrimary-50">
            {image ? (
              <Image
                src={image.url}
                alt={image.altText || product.name}
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            ) : (
              <LuImage className="text-lg text-neutralPrimary-300" />
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span
              className="max-w-[280px] truncate text-sm font-medium text-neutralPrimary-800"
              title={product.name}
            >
              {product.name}
            </span>
            {meta.length > 0 && (
              <span className="truncate text-xs text-neutralPrimary-500">
                {meta.join(" · ")}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = PRODUCT_TYPE[row.original.type];
      if (!type) return "—";
      const Icon = type.icon;
      return (
        <span className={`${BADGE_BASE} ${type.badge}`}>
          <Icon className="h-3 w-3" />
          {type.label}
        </span>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="text-sm text-neutralPrimary-700">
          {row.original.categoryName || "—"}
        </span>
        {row.original.categoryParentName && (
          <span className="text-xs text-neutralPrimary-500">
            {row.original.categoryParentName}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.type === "VARIABLE" ? (
        <VariablePrice product={row.original} />
      ) : (
        <SinglePrice item={row.original} />
      ),
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    enableSorting: false,
    cell: ({ row }) => {
      const stock = STOCK_STATUS[row.original.stockStatus];
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm tabular-nums text-neutralPrimary-700">
            {row.original.quantity.toLocaleString()}{" "}
            <span className="text-neutralPrimary-500">units</span>
          </span>
          {stock && (
            <span className={`${BADGE_BASE} ${stock.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} />
              {stock.label}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const status = PRODUCT_STATUS[row.original.status];
      if (!status) return "—";
      return (
        <span className={`${BADGE_BASE} ${status.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      );
    },
  },
  {
    // Featured products appear in "Our Must-Haves" on the home page.
    accessorKey: "featured",
    header: "Featured",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.featured ? (
        <span
          className={`${BADGE_BASE} text-amber-700 bg-amber-50 ring-amber-600/20`}
          title="Shown in Our Must-Haves on the home page"
        >
          <LuStar className="h-3 w-3 fill-current" />
          Featured
        </span>
      ) : (
        <span className="text-sm text-neutralPrimary-400" title="Not featured">
          —
        </span>
      ),
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      // Deleted (archived) products are read-only: view only.
      const isArchived = row.original.status === "ARCHIVED";
      return (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => handleView(row.original)}>
            <CustomTooltip action="view" content="View" />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(row.original)}
            disabled={isArchived}
            className="disabled:pointer-events-none disabled:opacity-40"
          >
            <CustomTooltip
              action="edit"
              content={isArchived ? "Archived products can't be edited" : "Edit"}
            />
          </button>
          {handleDelete && (
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              disabled={isArchived}
              className="disabled:pointer-events-none disabled:opacity-40"
            >
              <CustomTooltip
                action="delete"
                content={isArchived ? "Already archived" : "Delete"}
              />
            </button>
          )}
        </div>
      );
    },
  },
];
