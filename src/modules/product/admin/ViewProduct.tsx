"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Barcode,
  Boxes,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Info,
  Link2,
  Package,
  Percent,
  Rocket,
  Star,
  Tag,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import CancelButton from "@/components/primitives/button/CancelButton";
import { IModal } from "@/types";
import {
  IProduct,
  IProductImage,
  IProductUser,
  IProductVariant,
} from "@/modules/product/types/product.types";
import { toPlainText } from "@/modules/product/utils/product-text.utils";

type ProductStatus = IProduct["status"];
type StockStatus = IProduct["stockStatus"];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

// Prices can arrive as Decimal strings, so coerce before formatting.
const formatBDT = (value: number | string | null | undefined) =>
  `৳${Number(value ?? 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<
  ProductStatus,
  { pill: string; dot: string; label: string }
> = {
  ACTIVE: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    label: "Active",
  },
  DRAFT: {
    pill: "bg-blueSecondary-50 text-blueSecondary-600 ring-blueSecondary-600/20",
    dot: "bg-blueSecondary-600",
    label: "Draft",
  },
  INACTIVE: {
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    label: "Inactive",
  },
  ARCHIVED: {
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-500/20",
    dot: "bg-neutralPrimary-500",
    label: "Archived",
  },
};

const STOCK_STYLES: Record<
  StockStatus,
  { tile: string; label: string; hint: string }
> = {
  IN_STOCK: {
    tile: "bg-greenPrimary-950 text-greenPrimary-700",
    label: "In stock",
    hint: "Healthy stock level",
  },
  LOW_STOCK: {
    tile: "bg-warningPrimary-100 text-warningPrimary-600",
    label: "Low stock",
    hint: "10 units or fewer left",
  },
  OUT_OF_STOCK: {
    tile: "bg-destructive-100 text-destructive-600",
    label: "Out of stock",
    hint: "Can't be ordered",
  },
};

const TYPE_LABELS: Record<IProduct["type"], string> = {
  SIMPLE: "Simple",
  VARIABLE: "Variable",
  COMBO: "Combo",
};

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

// Shared lift-on-hover for cards.
const LIFT =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";


// ============ PRICING ============

type Priced = {
  price: number | string;
  discountPrice?: number | string | null;
  costPrice?: number | string | null;
};

/** What the customer pays and what the business keeps, per unit (product or size). */
function pricingOf(item: Priced) {
  const price = Number(item.price) || 0;
  const discount = Number(item.discountPrice) || 0;
  const cost = Number(item.costPrice) || 0;
  // 0 means "no discount"; the server rejects a discount at or above the price.
  const hasDiscount = discount > 0 && discount < price;
  const selling = hasDiscount ? discount : price;
  const savings = hasDiscount ? price - discount : 0;
  const savingsPercent = hasDiscount ? Math.round((savings / price) * 100) : 0;
  const hasCost = cost > 0;
  const profit = hasCost ? selling - cost : null;
  const margin =
    hasCost && selling > 0 ? Math.round(((selling - cost) / selling) * 100) : null;

  return {
    price,
    discount,
    cost,
    hasDiscount,
    selling,
    savings,
    savingsPercent,
    hasCost,
    profit,
    margin,
  };
}

// ============ BUILDING BLOCKS ============

function StatusPill({ status }: { status?: ProductStatus }) {
  if (!status) return null;
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-transform duration-300 hover:scale-105 ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "ACTIVE" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {style.label}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`group relative min-w-0 cursor-default overflow-hidden rounded-xl p-3 sm:p-4 ${ENTER} ${LIFT} ${className}`}
      style={enterDelay(delay)}
    >
      {/* Decorative glow that grows on hover */}
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-current opacity-[0.06] transition-transform duration-500 ease-out group-hover:scale-[2.2]" />
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:gap-2 sm:text-xs">
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 origin-left truncate text-lg font-bold tabular-nums transition-transform duration-300 group-hover:scale-105 sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Flag({
  on,
  icon,
  label,
  onText,
  offText,
  delay = 0,
}: {
  on: boolean;
  icon: React.ReactNode;
  label: string;
  onText: string;
  offText: string;
  delay?: number;
}) {
  return (
    <div
      style={enterDelay(delay)}
      className={`group flex cursor-default items-center gap-3 rounded-xl border p-3 ${ENTER} ${LIFT} ${
        on
          ? "border-greenPrimary-200 bg-greenPrimary-950 hover:border-greenPrimary-400"
          : "border-neutralPrimary-100 bg-neutralPrimary-50 hover:border-neutralPrimary-200"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
          on
            ? "bg-greenPrimary-600 text-white"
            : "bg-neutralPrimary-200 text-neutralPrimary-500"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutralPrimary-700">{label}</p>
        <p
          className={`break-words text-xs ${
            on ? "text-greenPrimary-600" : "text-neutralPrimary-400"
          }`}
        >
          {on ? onText : offText}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
  delay = 0,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} group min-w-0 rounded-xl border border-neutralPrimary-100 bg-white p-3 transition-all duration-300 hover:border-greenPrimary-200 hover:shadow-md sm:p-4 ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
          <span className="text-greenPrimary-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            {icon}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** One label/value line in a details list. */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-neutralPrimary-400">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </span>
        <span className="min-w-0 text-sm text-neutralPrimary-700 [overflow-wrap:anywhere] sm:text-right">
          {children}
        </span>
      </div>
    </div>
  );
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="italic text-neutralPrimary-400">{children}</span>
);

/** One line of the price breakdown. */
function PriceLine({
  label,
  value,
  tone = "default",
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "good" | "bad" | "muted";
  strong?: boolean;
}) {
  const toneClass = {
    default: "text-neutralPrimary-700",
    good: "text-success-600",
    bad: "text-destructive-600",
    muted: "text-neutralPrimary-400",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-neutralPrimary-500">{label}</span>
      <span
        className={`text-sm tabular-nums ${strong ? "font-bold" : "font-medium"} ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function AuditRow({
  label,
  date,
  user,
}: {
  label: string;
  date?: string | null;
  user?: IProductUser | null;
}) {
  return (
    <div className="group flex min-w-0 cursor-default items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-sm font-semibold text-blueSecondary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blueSecondary-600 group-hover:text-white group-hover:shadow-md">
        {user?.name ? user.name.charAt(0).toUpperCase() : <Calendar size={16} />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        <p className="break-words text-sm text-neutralPrimary-700">
          {formatDate(date)}
          {user?.name && (
            <span className="text-neutralPrimary-400"> by {user.name}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ============ SIZES (VARIABLE) ============

const SIZE_STOCK_TEXT: Record<StockStatus, string> = {
  IN_STOCK: "text-success-600",
  LOW_STOCK: "text-warningPrimary-600",
  OUT_OF_STOCK: "text-destructive-600",
};

/** Every size with its own price, discount, stock and status. */
function VariantsTable({ variants }: { variants: IProductVariant[] }) {
  const showCost = variants.some((v) => Number(v.costPrice) > 0);

  return (
    // * Scrolls sideways on phones rather than squeezing the columns.
    <div className="-mx-3 overflow-x-auto px-3 scrollbar-brand sm:-mx-4 sm:px-4">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-neutralPrimary-100 text-left text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
            <th className="py-2 pr-3">Size</th>
            <th className="py-2 pr-3 text-right">Base price</th>
            <th className="py-2 pr-3 text-right">Discount price</th>
            <th className="py-2 pr-3 text-right">Customer pays</th>
            {showCost && (
              <th className="py-2 pr-3 text-right">Profit / unit</th>
            )}
            <th className="py-2 pr-3 text-right">Stock</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutralPrimary-100">
          {variants.map((v) => {
            const p = pricingOf(v);
            const inactive = v.status === "INACTIVE";
            return (
              <tr
                key={v.id}
                className={`transition-colors hover:bg-neutralPrimary-50 ${inactive ? "opacity-60" : ""}`}
              >
                <td className="py-2.5 pr-3">
                  <span className="font-semibold text-neutralPrimary-700">
                    {v.size}
                  </span>
                  {v.sku && (
                    <span className="block font-mono text-[11px] text-neutralPrimary-400">
                      {v.sku}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-neutralPrimary-600">
                  {formatBDT(p.price)}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">
                  {p.hasDiscount ? (
                    <span className="text-neutralPrimary-700">
                      {formatBDT(p.discount)}
                      <span className="ml-1 text-xs font-semibold text-destructive-600">
                        (-{p.savingsPercent}%)
                      </span>
                    </span>
                  ) : (
                    <Muted>—</Muted>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-greenPrimary-700">
                  {formatBDT(p.selling)}
                </td>
                {showCost && (
                  <td
                    className={`py-2.5 pr-3 text-right tabular-nums ${
                      p.profit === null
                        ? "text-neutralPrimary-400"
                        : p.profit < 0
                          ? "text-destructive-600"
                          : "text-success-600"
                    }`}
                  >
                    {p.profit === null
                      ? "—"
                      : `${formatBDT(p.profit)}${p.margin !== null ? ` · ${p.margin}%` : ""}`}
                  </td>
                )}
                <td
                  className={`py-2.5 pr-3 text-right font-medium tabular-nums ${SIZE_STOCK_TEXT[v.stockStatus] ?? ""}`}
                >
                  {Number(v.quantity).toLocaleString()}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      inactive
                        ? "bg-neutralPrimary-100 text-neutralPrimary-500"
                        : "bg-success-100 text-success-600"
                    }`}
                  >
                    {inactive ? "Inactive" : "Active"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============ GALLERY ============

function Gallery({ images, name }: { images: IProductImage[]; name: string }) {
  const primaryIndex = Math.max(
    images.findIndex((image) => image.isPrimary),
    0,
  );
  const [active, setActive] = useState(primaryIndex);
  const current = images[active];

  if (!current) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutralPrimary-200 bg-white/70 text-neutralPrimary-400">
        <ImageIcon size={32} />
        <span className="text-xs">No images</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="group/img relative aspect-square w-full overflow-hidden rounded-2xl border border-white bg-white shadow-md">
        <Image
          key={current.id}
          src={current.url}
          alt={current.altText || name}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="animate-in fade-in object-contain p-2 duration-300 transition-transform group-hover/img:scale-105 motion-reduce:animate-none"
        />
        {current.isPrimary && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-greenPrimary-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            <Star size={10} className="fill-current" />
            Primary
          </span>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-neutralPrimary-800/70 px-2 py-0.5 text-[10px] font-semibold text-white">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1 scrollbar-brand">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === active}
              className={`relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-[border-color,opacity,box-shadow] duration-200 ${
                index === active
                  ? "border-greenPrimary-500 shadow-md"
                  : "border-transparent opacity-70 hover:border-greenPrimary-200 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText || name}
                fill
                sizes="56px"
                className="object-contain p-0.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ VIEW ============

export default function ViewProduct({ data, setOpen }: IModal) {
  const product = data as IProduct | undefined;

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <Package size={32} />
        No product details available.
      </div>
    );
  }

  const pricing = pricingOf(product);
  const stock = STOCK_STYLES[product.stockStatus] ?? STOCK_STYLES.OUT_OF_STOCK;
  const images = product.images ?? [];
  const isLive = product.status === "ACTIVE";
  const quantity = Number(product.quantity) || 0;

  // * A VARIABLE product's own price/stock only mirror its first active size,
  // * so the hero, stats and stock value are worked out from the sizes.
  const variants =
    product.type === "VARIABLE"
      ? [...(product.variants ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
      : [];
  const isVariable = variants.length > 0;
  const activeVariants = variants.filter((v) => v.status !== "INACTIVE");
  const sellingPrices = activeVariants.map((v) => pricingOf(v).selling);
  const minSelling = sellingPrices.length ? Math.min(...sellingPrices) : 0;
  const maxSelling = sellingPrices.length ? Math.max(...sellingPrices) : 0;
  const stockValue = isVariable
    ? activeVariants.reduce(
        (sum, v) => sum + (Number(v.quantity) || 0) * pricingOf(v).selling,
        0,
      )
    : quantity * pricing.selling;
  const outOfStockSizes = activeVariants.filter((v) => Number(v.quantity) <= 0);
  const tags = product.tags ?? [];
  const shortDescription = toPlainText(product.shortDescription);

  return (
    <div className="w-full min-w-0 space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} group/hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 transition-shadow duration-500 hover:shadow-lg hover:ring-greenPrimary-200 sm:p-5`}
      >
        {/* Light sheen that sweeps across on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover/hero:left-full group-hover/hero:opacity-100 motion-reduce:hidden" />

        <div className="relative grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[260px] sm:max-w-none">
            <Gallery images={images} name={product.name} />
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            {/* Category trail */}
            <nav className="flex flex-wrap items-center gap-1 text-xs text-neutralPrimary-400">
              {product.categoryParentName && (
                <>
                  <span className="break-all">{product.categoryParentName}</span>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              <span className="break-all font-semibold text-greenPrimary-600">
                {product.categoryName || "Uncategorised"}
              </span>
            </nav>

            <h2 className="break-words text-xl font-bold leading-tight text-neutralPrimary-800 sm:text-2xl">
              {product.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={product.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-purpleSecondary-100 px-2.5 py-1 text-xs font-semibold text-purpleSecondary-500">
                <Boxes size={12} />
                {TYPE_LABELS[product.type] ?? product.type}
              </span>
              {product.featured && (
                <span className="group/star inline-flex items-center gap-1 rounded-full bg-yellowSecondary-100 px-2.5 py-1 text-xs font-semibold text-yellowSecondary-800">
                  <Star
                    size={12}
                    className="fill-current transition-transform duration-700 group-hover/star:rotate-[216deg]"
                  />
                  Featured
                </span>
              )}
            </div>

            {/* Price as the customer sees it */}
            {isVariable ? (
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold tabular-nums text-greenPrimary-700 sm:text-4xl">
                  {activeVariants.length === 0
                    ? "—"
                    : minSelling === maxSelling
                      ? formatBDT(minSelling)
                      : `${formatBDT(minSelling)} – ${formatBDT(maxSelling)}`}
                </span>
                <span className="text-xs text-neutralPrimary-500">
                  {variants.length} size{variants.length === 1 ? "" : "s"}
                  {variants.length !== activeVariants.length &&
                    ` (${activeVariants.length} active)`}{" "}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-3xl font-extrabold tabular-nums text-greenPrimary-700 sm:text-4xl">
                  {formatBDT(pricing.selling)}
                </span>
                {pricing.hasDiscount && (
                  <>
                    <span className="pb-1 text-base tabular-nums text-neutralPrimary-400 line-through">
                      {formatBDT(pricing.price)}
                    </span>
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-destructive-100 px-2 py-0.5 text-xs font-bold text-destructive-600">
                      <Percent size={11} />
                      {pricing.savingsPercent}% off
                    </span>
                  </>
                )}
              </div>
            )}

            {shortDescription && (
              <p className="line-clamp-3 text-sm leading-relaxed text-neutralPrimary-600 [overflow-wrap:anywhere]">
                {shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warnings that need the admin's attention */}
      {(product.stockStatus !== "IN_STOCK" ||
        !isLive ||
        outOfStockSizes.length > 0) && (
        <div
          style={enterDelay(80)}
          className={`${ENTER} flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600`}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 animate-pulse motion-reduce:animate-none"
          />
          <p className="break-words">
            {!isLive ? (
              <>
                <span className="font-semibold">Not on the shop.</span> This
                product is {product.status.toLowerCase()}, so customers can&apos;t
                see or order it.
              </>
            ) : product.stockStatus === "OUT_OF_STOCK" ? (
              <>
                <span className="font-semibold">Out of stock.</span> Customers
                can see this product but can&apos;t order it until stock is added.
              </>
            ) : product.stockStatus === "LOW_STOCK" ? (
              <>
                <span className="font-semibold">Running low.</span> Only{" "}
                {quantity} unit{quantity === 1 ? "" : "s"} left.
              </>
            ) : (
              <>
                <span className="font-semibold">
                  Some sizes are out of stock:
                </span>{" "}
                {outOfStockSizes.map((v) => v.size).join(", ")}. Customers
                can&apos;t order {outOfStockSizes.length === 1 ? "it" : "them"}{" "}
                until stock is added.
              </>
            )}
          </p>
        </div>
      )}

      {/* Stats */}
      <div
        className={`grid grid-cols-2 gap-2 sm:gap-3 ${isVariable ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
      >
        <StatTile
          icon={<Package size={14} />}
          label="Stock"
          value={quantity.toLocaleString()}
          hint={
            isVariable
              ? `${stock.label} · all active sizes`
              : `${stock.label} · ${stock.hint}`
          }
          className={stock.tile}
          delay={100}
        />
        <StatTile
          icon={<Wallet size={14} />}
          label="Stock Value"
          value={formatBDT(stockValue)}
          hint={
            isVariable
              ? "Σ units × selling price, per size"
              : "Units × selling price"
          }
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={170}
        />
        {isVariable ? (
          <>
            <StatTile
              icon={<Boxes size={14} />}
              label="Sizes"
              value={variants.length}
              hint={`${activeVariants.length} active · ${variants.length - activeVariants.length} inactive`}
              className="col-span-2 bg-purpleSecondary-100 text-purpleSecondary-500 lg:col-span-1"
              delay={240}
            />
          </>
        ) : (
          <>
            <StatTile
              icon={<TrendingUp size={14} />}
              label="Profit / Unit"
              value={pricing.profit === null ? "—" : formatBDT(pricing.profit)}
              hint={
                pricing.hasCost
                  ? "Selling price − cost"
                  : "Add a cost price to see this"
              }
              className={
                pricing.profit !== null && pricing.profit < 0
                  ? "bg-destructive-100 text-destructive-600"
                  : "bg-purpleSecondary-100 text-purpleSecondary-500"
              }
              delay={240}
            />
            <StatTile
              icon={<Percent size={14} />}
              label="Margin"
              value={pricing.margin === null ? "—" : `${pricing.margin}%`}
              hint={
                pricing.hasCost
                  ? "Of the selling price"
                  : "No cost price recorded"
              }
              className="bg-orangeSecondary-100 text-orangeSecondary-500"
              delay={310}
            />
          </>
        )}
      </div>

      {/* Visibility */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Flag
          on={isLive}
          icon={isLive ? <Eye size={18} /> : <EyeOff size={18} />}
          label="Storefront"
          onText="Visible to customers"
          offText={`Hidden (${product.status.toLowerCase()})`}
          delay={380}
        />
        <Flag
          on={product.stockStatus !== "OUT_OF_STOCK"}
          icon={<Package size={18} />}
          label="Orderable"
          onText={`${quantity.toLocaleString()} units available`}
          offText="No stock to sell"
          delay={440}
        />
        <Flag
          on={!!product.publishedAt}
          icon={<Rocket size={18} />}
          label="Published"
          onText={`Since ${formatDate(product.publishedAt)}`}
          offText="Never been live"
          delay={500}
        />
        <Flag
          on={!!product.featured}
          icon={<Star size={18} className={product.featured ? "fill-current" : ""} />}
          label="Featured"
          onText={
            isLive
              ? "Shown in Our Must-Haves"
              : "Featured, but hidden until Active"
          }
          offText="Not in Our Must-Haves"
          delay={560}
        />
      </div>

      {/* Description */}
      <Section delay={530} icon={<FileText size={16} />} title="Description">
        {product.description ? (
          <div
            className="max-w-none overflow-hidden text-sm leading-relaxed text-neutralPrimary-600 [overflow-wrap:anywhere] [&_*]:max-w-full [&_*]:![text-align:left] [&_img]:h-auto [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p]:min-h-[1.2em] [&_strong]:font-semibold [&_table]:w-full [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            No description added.
          </p>
        )}
      </Section>

      {/* Variable: every size's price and stock (replaces the single breakdown) */}
      {isVariable && (
        <Section delay={560} icon={<Boxes size={16} />} title="Sizes & Pricing">
          <VariantsTable variants={variants} />
        </Section>
      )}

      {/* Pricing + product details side by side on wide screens */}
      <div
        className={`grid grid-cols-1 gap-4 ${isVariable ? "" : "lg:grid-cols-2"}`}
      >
        {!isVariable && (
          <Section
            delay={560}
            icon={<Wallet size={16} />}
            title="Pricing Breakdown"
            aside={
              pricing.hasDiscount && (
                <span className="rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-600">
                  On sale
                </span>
              )
            }
          >
            <div className="divide-y divide-neutralPrimary-100">
              <PriceLine
                label="Regular price"
                value={formatBDT(pricing.price)}
              />
              <PriceLine
                label="Discount price"
                value={
                  pricing.hasDiscount
                    ? formatBDT(pricing.discount)
                    : "No discount"
                }
                tone={pricing.hasDiscount ? "default" : "muted"}
              />
              {pricing.hasDiscount && (
                <PriceLine
                  label="Customer saves"
                  value={`${formatBDT(pricing.savings)} (${pricing.savingsPercent}%)`}
                  tone="good"
                />
              )}
              <PriceLine
                label="Customer pays"
                value={formatBDT(pricing.selling)}
                strong
              />
              <PriceLine
                label="Cost price"
                value={
                  pricing.hasCost ? formatBDT(pricing.cost) : "Not recorded"
                }
                tone={pricing.hasCost ? "default" : "muted"}
              />
              {pricing.profit !== null && (
                <PriceLine
                  label="Profit per unit"
                  value={`${formatBDT(pricing.profit)}${
                    pricing.margin !== null ? ` · ${pricing.margin}%` : ""
                  }`}
                  tone={pricing.profit < 0 ? "bad" : "good"}
                  strong
                />
              )}
            </div>
          </Section>
        )}

        <Section delay={620} icon={<Info size={16} />} title="Product Details">
          <div className="divide-y divide-neutralPrimary-100">
            <DetailRow icon={<Boxes size={14} />} label="Type">
              {TYPE_LABELS[product.type] ?? product.type}
            </DetailRow>
            <DetailRow icon={<Tag size={14} />} label="SKU">
              {product.sku || <Muted>Not set</Muted>}
            </DetailRow>
            <DetailRow icon={<Barcode size={14} />} label="Barcode">
              {product.barcode || <Muted>Not set</Muted>}
            </DetailRow>
            <DetailRow icon={<Link2 size={14} />} label="URL slug">
              <span className="break-all font-mono text-xs">{product.slug}</span>
            </DetailRow>
            <DetailRow icon={<ImageIcon size={14} />} label="Images">
              {images.length} image{images.length === 1 ? "" : "s"}
            </DetailRow>
            <DetailRow icon={<Tags size={14} />} label="Tags">
              {tags.length > 0 ? (
                <span className="flex flex-wrap gap-1 sm:justify-end">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-greenPrimary-950 px-2 py-0.5 text-xs font-medium text-greenPrimary-700"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              ) : (
                <Muted>None</Muted>
              )}
            </DetailRow>
          </div>
        </Section>
      </div>

      {/* Audit */}
      <div
        style={enterDelay(740)}
        className={`${ENTER} grid grid-cols-1 gap-3 rounded-xl bg-neutralPrimary-50 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4`}
      >
        <AuditRow
          label="Created"
          date={product.createdAt}
          user={product.createdByUser}
        />
        <AuditRow
          label="Last Updated"
          date={product.updatedAt}
          user={product.updatedByUser}
        />
      </div>

      <div className="flex justify-end border-t border-neutralPrimary-100 pt-4">
        <CancelButton
          onClick={() => setOpen?.(false)}
          label="Close"
          className="w-full transition-all hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 hover:shadow-md active:translate-y-0 active:scale-95 sm:w-auto"
        />
      </div>
    </div>
  );
}
