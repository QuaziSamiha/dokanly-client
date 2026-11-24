import { cn } from "@/lib/utils";
import {
  AccountCard,
  OrderStatusBadge,
  outlineButtonClass,
} from "@/modules/account/customer/AccountUI";
import { IOrder } from "@/modules/order/types/order.types";
import {
  CUSTOMER_STATUS_COPY,
  estimatedDelivery,
  formatOrderDate,
  orderImageUrl,
  ORDER_PROGRESS_STEPS,
  progressIndex,
} from "@/modules/order/utils/customer-order.utils";
import { formatBDT, itemCount } from "@/modules/order/utils/order.utils";
import { ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MAX_THUMBS = 4;

/** One order in "My orders" and on the overview. The whole card opens the order. */
export default function OrderCard({
  order,
  compact = false,
}: {
  order: IOrder;
  compact?: boolean;
}) {
  const href = `/my-account/order/${order.id}`;
  const items = order.orderItems ?? [];
  const count = itemCount(order);
  const step = progressIndex(order.status);
  const isActive = step >= 0 && order.status !== "DELIVERED";
  const eta = isActive ? estimatedDelivery(order.createdAt, order.estimatedDays) : undefined;
  const extra = items.length - MAX_THUMBS;

  return (
    <AccountCard as="article" className="group relative transition-shadow duration-200 hover:shadow-md">
      {/* ==== HEADER: NUMBER, DATE, STATUS, TOTAL ==== */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-neutralPrimary-200 px-4 sm:px-5 py-3 bg-neutralPrimary-50/60 rounded-t-2xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Link
            href={href}
            className="font-semibold text-neutralPrimary-800 hover:text-greenPrimary-600 after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-greenPrimary-500"
          >
            {order.orderId}
          </Link>
          <span className="text-neutralPrimary-500">
            Placed {formatOrderDate(order.createdAt)}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-4 px-4 sm:px-5 py-4">
        <div className="flex items-center gap-4">
          {/* ==== THUMBNAILS ==== */}
          <div className="flex -space-x-3 shrink-0">
            {items.slice(0, MAX_THUMBS).map((item) => (
              <span
                key={item.id}
                className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-xl border-2 border-white bg-neutralPrimary-100 shadow-sm"
              >
                {item.imageUrl ? (
                  <Image
                    src={orderImageUrl(item.imageUrl) as string}
                    unoptimized
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <ImageOff className="absolute inset-0 m-auto h-5 w-5 text-neutralPrimary-300" />
                )}
              </span>
            ))}
            {extra > 0 && (
              <span className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl border-2 border-white bg-neutralPrimary-100 text-sm font-semibold text-neutralPrimary-600 shadow-sm">
                +{extra}
              </span>
            )}
          </div>

          {/* ==== WHAT AND HOW MUCH ==== */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutralPrimary-800 line-clamp-1">
              {items[0]?.productName}
              {items.length > 1 && (
                <span className="font-normal text-neutralPrimary-500">
                  {" "}+ {items.length - 1} more
                </span>
              )}
            </p>
            <p className="text-xs text-neutralPrimary-500">
              {count} item{count === 1 ? "" : "s"} · {formatBDT(order.grandTotal)}
            </p>
            {!compact && (
              <p className="text-xs text-neutralPrimary-600 mt-1">
                {eta && order.status !== "SHIPPED" ? (
                  <>
                    Estimated delivery by{" "}
                    <span className="font-semibold text-neutralPrimary-800">{eta}</span>
                  </>
                ) : (
                  CUSTOMER_STATUS_COPY[order.status]?.hint
                )}
              </p>
            )}
          </div>

          <ChevronRight className="hidden sm:block h-5 w-5 shrink-0 text-neutralPrimary-300 transition-transform group-hover:translate-x-0.5 group-hover:text-greenPrimary-500" />
        </div>

        {/* ==== MINI PROGRESS FOR ORDERS STILL ON THEIR WAY ==== */}
        {isActive && (
          <div className="flex flex-col gap-1.5" aria-hidden="true">
            <div className="grid grid-cols-5 gap-1">
              {ORDER_PROGRESS_STEPS.map((s, i) => (
                <span
                  key={s.status}
                  className={cn(
                    "h-1.5 rounded-full",
                    i <= step ? "bg-greenPrimary-500" : "bg-neutralPrimary-200",
                  )}
                />
              ))}
            </div>
            {!compact && (
              <div className="hidden sm:grid grid-cols-5 gap-1 text-[11px] text-neutralPrimary-500">
                {ORDER_PROGRESS_STEPS.map((s, i) => (
                  <span
                    key={s.status}
                    className={cn(i === step && "font-semibold text-greenPrimary-700")}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!compact && (
          <div className="relative z-10 flex flex-wrap items-center justify-end gap-2">
            <Link href={href} className={outlineButtonClass}>
              {isActive ? "Track order" : "View details"}
            </Link>
          </div>
        )}
      </div>
    </AccountCard>
  );
}
