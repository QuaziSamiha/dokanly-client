"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  BadgePercent,
  Ban,
  CheckCircle2,
  Copy,
  ImageIcon,
  MoreHorizontal,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IOrder, IOrderItem } from "@/modules/order/types/order.types";
import {
  BADGE_BASE,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
  courierBadgeClass,
  customerName,
  formatBDT,
  formatCourierStatus,
  formatDateTime,
  initials,
  itemCount,
  timeAgo,
} from "@/modules/order/utils/order.utils";

export type OrderRowActions = {
  onView: (order: IOrder) => void;
  onEdit: (order: IOrder) => void;
  onDownloadInvoice: (order: IOrder) => void;
  onConfirm: (order: IOrder) => void;
  onCancel: (order: IOrder) => void;
};

const copy = (text: string, what: string) => {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success(`${what} copied`))
    .catch(() => toast.error(`Couldn't copy the ${what.toLowerCase()}`));
};

/** A product thumbnail; old orders may point at images that no longer exist. */
export function ItemThumb({
  item,
  size = 36,
  className = "",
}: {
  item: IOrderItem;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutralPrimary-200 bg-white ${className}`}
      style={{ width: size, height: size }}
      title={`${item.productName} ×${item.quantity}`}
    >
      {item.imageUrl && !failed ? (
        <Image
          src={item.imageUrl}
          alt={item.productName}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <ImageIcon size={size / 2.4} className="text-neutralPrimary-300" />
      )}
    </span>
  );
}

export const orderColumns = ({
  onView,
  onEdit,
  onDownloadInvoice,
  onConfirm,
  onCancel,
}: OrderRowActions): ColumnDef<IOrder>[] => [
  {
    accessorKey: "orderId",
    header: "Order",
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original;
      const count = itemCount(order);
      return (
        <div className="flex min-w-[150px] flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onView(order)}
            className="w-fit cursor-pointer font-mono text-sm font-semibold text-neutralPrimary-800 underline-offset-2 hover:text-greenPrimary-600 hover:underline"
          >
            {order.orderId}
          </button>
          <span
            className="text-xs text-neutralPrimary-500"
            title={formatDateTime(order.createdAt)}
          >
            {timeAgo(order.createdAt)} · {count} item{count === 1 ? "" : "s"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original;
      const isGuest = !order.customerId;
      return (
        <div className="flex min-w-[190px] items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              isGuest
                ? "bg-neutralPrimary-100 text-neutralPrimary-500"
                : "bg-greenPrimary-950 text-greenPrimary-700"
            }`}
          >
            {initials(order)}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5">
              <span
                className="max-w-[160px] truncate text-sm font-medium text-neutralPrimary-800"
                title={customerName(order)}
              >
                {customerName(order)}
              </span>
              {isGuest && (
                <span className="rounded bg-neutralPrimary-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-neutralPrimary-500">
                  Guest
                </span>
              )}
            </span>
            <a
              href={`tel:${order.phone}`}
              className="w-fit text-xs tabular-nums text-neutralPrimary-500 hover:text-greenPrimary-600"
            >
              {order.phone}
            </a>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "orderItems",
    header: "Items",
    enableSorting: false,
    cell: ({ row }) => {
      const items = row.original.orderItems ?? [];
      const shown = items.slice(0, 3);
      const extra = items.length - shown.length;
      return (
        <div
          className="flex items-center"
          title={items.map((i) => `${i.productName} ×${i.quantity}`).join("\n")}
        >
          {shown.map((item, index) => (
            <ItemThumb
              key={item.id}
              item={item}
              className={`ring-2 ring-white ${index ? "-ml-2" : ""}`}
            />
          ))}
          {extra > 0 && (
            <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-md bg-neutralPrimary-100 text-xs font-semibold text-neutralPrimary-600 ring-2 ring-white">
              +{extra}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="text-sm font-semibold tabular-nums text-neutralPrimary-800">
            {formatBDT(order.grandTotal)}
          </span>
          <span className="text-xs text-neutralPrimary-500">
            {order.paymentMethod === "CASH_ON_DELIVERY"
              ? "COD"
              : PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </span>
          <span className="flex items-center gap-1">
            {order.couponCode && (
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-purpleSecondary-500"
                title={`Coupon ${order.couponCode}: −${formatBDT(order.discount)}`}
              >
                <BadgePercent size={11} />
                {order.couponCode}
              </span>
            )}
            {order.isFreeDelivery && Number(order.deliveryCharge) === 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-greenPrimary-600"
                title="Free delivery applied"
              >
                <Truck size={11} />
                Free
              </span>
            )}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    enableSorting: false,
    cell: ({ row }) => {
      const style = PAYMENT_STATUS_STYLES[row.original.paymentStatus];
      if (!style) return "—";
      return (
        <span className={`${BADGE_BASE} ${style.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = ORDER_STATUS_STYLES[row.original.status];
      if (!style) return "—";
      return (
        <span className={`${BADGE_BASE} ${style.badge}`} title={style.hint}>
          <span className="relative flex h-1.5 w-1.5">
            {row.original.status === "PENDING" && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
              />
            )}
            <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
          </span>
          {style.label}
        </span>
      );
    },
  },
  {
    accessorKey: "courierStatus",
    header: "Courier",
    enableSorting: false,
    cell: ({ row }) => {
      const { courierStatus, trackingId } = row.original;
      if (!trackingId && !courierStatus) {
        return <span className="text-xs text-neutralPrimary-400">Not sent</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          <span className={`${BADGE_BASE} ${courierBadgeClass(courierStatus)}`}>
            <Truck size={11} />
            {formatCourierStatus(courierStatus)}
          </span>
          {trackingId && (
            <button
              type="button"
              onClick={() => copy(trackingId, "Tracking ID")}
              className="w-fit cursor-pointer font-mono text-[11px] text-neutralPrimary-500 hover:text-greenPrimary-600"
              title="Copy Steadfast tracking ID"
            >
              #{trackingId}
            </button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original;
      const canConfirm = order.status === "PENDING";
      const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";
      return (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onView(order)} aria-label="View order">
            <CustomTooltip action="view" content="View" />
          </button>
          <button type="button" onClick={() => onEdit(order)} aria-label="Edit order">
            <CustomTooltip action="edit" content="Edit" />
          </button>
          <button
            type="button"
            onClick={() => onDownloadInvoice(order)}
            aria-label="Download invoice"
          >
            <CustomTooltip action="download" content="Download Invoice" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="cursor-pointer rounded-md p-1 text-neutralPrimary-500 transition-colors hover:bg-neutralPrimary-100 hover:text-neutralPrimary-800"
              >
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-mono text-xs text-neutralPrimary-500">
                {order.orderId}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canConfirm && (
                <DropdownMenuItem
                  onClick={() => onConfirm(order)}
                  className="cursor-pointer text-sky-700"
                >
                  <CheckCircle2 size={14} /> Confirm order
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="cursor-pointer text-rose-700"
                >
                  <Ban size={14} /> Cancel order
                </DropdownMenuItem>
              )}
              {(canConfirm || canCancel) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => copy(order.orderId, "Order number")}
                className="cursor-pointer"
              >
                <Copy size={14} /> Copy order number
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copy(order.phone, "Phone number")}
                className="cursor-pointer"
              >
                <Phone size={14} /> Copy phone
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copy(
                    `${customerName(order)}, ${order.phone}\n${[order.street, order.city, order.zipCode].filter(Boolean).join(", ")}`,
                    "Address",
                  )
                }
                className="cursor-pointer"
              >
                <UserRound size={14} /> Copy name & address
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
