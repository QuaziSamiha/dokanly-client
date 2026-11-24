"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGet } from "@/hooks/api/useGet";
import { cn } from "@/lib/utils";
import {
  AccountCard,
  AccountCardTitle,
  EmptyPanel,
  OrderStatusBadge,
  outlineButtonClass,
  primaryButtonClass,
} from "@/modules/account/customer/AccountUI";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import { orderDeliveryRegions } from "@/modules/checkout/constants/checkout.constants";
import { useUserOrderDetails } from "@/modules/order/hooks/useUserOrders";
import {
  ICustomerOrderDetails,
  ICustomerOrderItem,
  IOrderLiveStatus,
} from "@/modules/order/types/order.types";
import {
  CUSTOMER_STATUS_COPY,
  estimatedDelivery,
  orderImageUrl,
  progressIndex,
  statusChanges,
} from "@/modules/order/utils/customer-order.utils";
import {
  courierBadgeClass,
  BADGE_BASE,
  DELIVERY_METHOD_LABELS,
  formatBDT,
  formatCourierStatus,
  formatDateTime,
  itemCount,
  orderToInvoice,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
} from "@/modules/order/utils/order.utils";
import {
  ArrowLeft,
  Ban,
  Copy,
  CreditCard,
  FileDown,
  Headset,
  History,
  ImageOff,
  Loader2,
  MapPin,
  PackageX,
  ReceiptText,
  RefreshCw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import CancelOrderDialog from "./CancelOrderDialog";
import OrderProgress from "./OrderProgress";

const divisionName = (state?: string | null) =>
  orderDeliveryRegions.find((r) => r.id === state)?.name ?? state ?? "";

/** Puts the products back in the cart. Unavailable ones are skipped. */
const addItemsToCart = (items: ICustomerOrderItem[]) => {
  const available = items.filter((item) => item.isAvailable && item.productId);
  for (const item of available) {
    localCart.addItem({
      id: item.productId as number,
      variantId: item.variantId ?? undefined,
      size: item.variantSize ?? undefined,
      name: item.productName,
      //* ==== THE CART RE-PRICES EVERY LINE FROM THE API; THIS IS ONLY A PLACEHOLDER ====
      price: String(item.price),
      image: item.imageUrl ?? "",
      quantity: item.quantity,
    });
  }
  return { added: available.length, skipped: items.length - available.length };
};

export default function OrderDetails({ orderId }: { orderId: number }) {
  const router = useRouter();
  const { order, isOrderLoading, isOrderError } = useUserOrderDetails(orderId);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isOrderLoading) return <OrderDetailsSkeleton />;

  if (isOrderError || !order) {
    return (
      <EmptyPanel
        icon={PackageX}
        title="Order not found"
        description="This order doesn't exist or isn't linked to your account."
        action={
          <Link href="/my-account/order" className={primaryButtonClass}>
            Back to my orders
          </Link>
        }
      />
    );
  }

  const isStopped = progressIndex(order.status) < 0; // cancelled or refunded
  const isActive = !isStopped && order.status !== "DELIVERED";
  const eta = isActive ? estimatedDelivery(order.createdAt, order.estimatedDays) : undefined;
  const copy = CUSTOMER_STATUS_COPY[order.status];
  const canBuyAgain = order.orderItems.some((item) => item.isAvailable);
  const count = itemCount(order);
  const history = [...statusChanges(order.statusHistory)].reverse();

  const handleBuyAgain = (items: ICustomerOrderItem[]) => {
    const { added, skipped } = addItemsToCart(items);
    if (!added) {
      toast.info("These products are not available right now.");
      return;
    }
    toast.success(
      skipped
        ? `${added} product${added === 1 ? "" : "s"} added to your cart. ${skipped} ${skipped === 1 ? "is" : "are"} not available right now.`
        : `Added to your cart`,
      { duration: 2000 },
    );
    if (items.length > 1) router.push("/my-cart");
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      //* ==== THE PDF LIBRARY IS LARGE; LOAD IT ONLY WHEN SOMEONE ASKS FOR AN INVOICE ====
      const [{ pdf }, { default: InvoicePDF }, { saveAs }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/modules/checkout/public/InvoicePDF"),
        import("file-saver"),
      ]);
      const blob = await pdf(<InvoicePDF invoiceData={orderToInvoice(order)} />).toBlob();
      saveAs(blob, `invoice-${order.orderId}.pdf`);
    } catch {
      toast.error("Could not create the invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/my-account/order"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutralPrimary-600 hover:text-greenPrimary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my orders
      </Link>

      {/* ================= HEADER ================= */}
      <AccountCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-neutralPrimary-800">
                Order {order.orderId}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-neutralPrimary-500">
              Placed on {formatDateTime(order.createdAt)} · {count} item
              {count === 1 ? "" : "s"} · {formatBDT(order.grandTotal)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className={outlineButtonClass}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Invoice
            </button>
            {canBuyAgain && (
              <button
                type="button"
                onClick={() => handleBuyAgain(order.orderItems)}
                className={outlineButtonClass}
              >
                <ShoppingCart className="h-4 w-4" />
                Buy again
              </button>
            )}
            {order.canCancel && (
              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className={cn(
                  outlineButtonClass,
                  "text-destructive-600 hover:border-destructive-300 hover:bg-destructive-50 hover:text-destructive-700",
                )}
              >
                <Ban className="h-4 w-4" />
                Cancel order
              </button>
            )}
          </div>
        </div>

        {/* ==== WHAT IS HAPPENING NOW ==== */}
        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-xl p-4",
            isStopped
              ? "bg-rose-50 text-rose-800"
              : order.status === "DELIVERED"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-greenPrimary-950 text-greenPrimary-800",
          )}
        >
          <copy.icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-0.5 text-sm">
            <p className="font-semibold">{copy.hint}</p>
            {eta && (
              <p>
                Estimated delivery by <span className="font-semibold">{eta}</span>{" "}
                ({DELIVERY_METHOD_LABELS[order.deliveryMethod]}, usually within{" "}
                {order.estimatedDays} days)
              </p>
            )}
            {order.status === "DELIVERED" && order.deliveredAt && (
              <p>Delivered on {formatDateTime(order.deliveredAt)}</p>
            )}
            {order.status === "PENDING" && !order.canCancel && (
              <p>Need to change or cancel it? Contact us and we&apos;ll help.</p>
            )}
          </div>
        </div>

        {!isStopped && (
          <div className="mt-6 border-t border-neutralPrimary-200 pt-6">
            <OrderProgress
              status={order.status}
              timeline={order.statusHistory}
              createdAt={order.createdAt}
            />
          </div>
        )}
      </AccountCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col gap-6 xl:col-span-2 min-w-0">
          {/* ================= ITEMS ================= */}
          <AccountCard className="p-5 sm:p-6">
            <AccountCardTitle icon={ReceiptText} title={`Items (${count})`} />
            <ul className="mt-4 divide-y divide-neutralPrimary-200">
              {order.orderItems.map((item) => (
                <OrderLine key={item.id} item={item} onBuyAgain={() => handleBuyAgain([item])} />
              ))}
            </ul>
          </AccountCard>

          {order.trackingId && <CourierCard order={order} />}

          {/* ================= HISTORY ================= */}
          <AccountCard className="p-5 sm:p-6">
            <AccountCardTitle icon={History} title="Order history" />
            <ol className="mt-4 flex flex-col">
              {history.map((entry, i) => (
                <li key={`${entry.status}-${entry.createdAt}`} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < history.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[5px] top-4 bottom-0 w-px bg-neutralPrimary-200" />
                  )}
                  <span
                    className={cn(
                      "relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-white",
                      i === 0 ? "bg-greenPrimary-500" : "bg-neutralPrimary-300",
                    )}
                  />
                  <div className="flex flex-col">
                    <p className={cn("text-sm", i === 0 ? "font-semibold text-neutralPrimary-800" : "text-neutralPrimary-700")}>
                      {CUSTOMER_STATUS_COPY[entry.status]?.label ?? entry.status}
                    </p>
                    <p className="text-xs text-neutralPrimary-500">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </li>
              ))}
              {order.statusHistory.length === 0 && (
                <li className="text-sm text-neutralPrimary-500">
                  Order placed {formatDateTime(order.createdAt)}
                </li>
              )}
            </ol>
          </AccountCard>
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          {/* ================= SUMMARY ================= */}
          <AccountCard className="p-5 sm:p-6">
            <AccountCardTitle icon={ReceiptText} title="Order summary" />
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <SummaryRow label={`Subtotal (${count} item${count === 1 ? "" : "s"})`} value={formatBDT(order.subtotal)} />
              <SummaryRow
                label="Delivery"
                value={Number(order.deliveryCharge) === 0 ? "Free" : formatBDT(order.deliveryCharge)}
                valueClass={Number(order.deliveryCharge) === 0 ? "text-emerald-600 font-semibold" : undefined}
              />
              {Number(order.discount) > 0 && (
                <SummaryRow
                  label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"}
                  value={`−${formatBDT(order.discount)}`}
                  valueClass="text-emerald-600"
                />
              )}
              <div className="my-1 border-t border-dashed border-neutralPrimary-300" />
              <SummaryRow
                label="Total"
                value={formatBDT(order.grandTotal)}
                labelClass="text-base font-semibold text-neutralPrimary-800"
                valueClass="text-base font-bold text-neutralPrimary-800"
              />
            </dl>
          </AccountCard>

          {/* ================= PAYMENT ================= */}
          <AccountCard className="p-5 sm:p-6">
            <AccountCardTitle icon={CreditCard} title="Payment" />
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <SummaryRow label="Method" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutralPrimary-500">Status</dt>
                <dd>
                  <span className={cn(BADGE_BASE, PAYMENT_STATUS_STYLES[order.paymentStatus]?.badge)}>
                    {order.paymentMethod === "CASH_ON_DELIVERY" && order.paymentStatus === "PENDING"
                      ? "Pay on delivery"
                      : PAYMENT_STATUS_STYLES[order.paymentStatus]?.label}
                  </span>
                </dd>
              </div>
              {order.paidAt && <SummaryRow label="Paid on" value={formatDateTime(order.paidAt)} />}
              {order.transactionId && <SummaryRow label="Transaction" value={order.transactionId} valueClass="break-all" />}
            </dl>
          </AccountCard>

          {/* ================= DELIVERY ADDRESS ================= */}
          <AccountCard className="p-5 sm:p-6">
            <AccountCardTitle icon={MapPin} title="Delivery address" />
            <address className="mt-4 flex flex-col gap-0.5 text-sm not-italic text-neutralPrimary-700">
              <span className="font-semibold text-neutralPrimary-800">
                {[order.firstName, order.lastName].filter(Boolean).join(" ")}
              </span>
              <span>{order.street}</span>
              <span>
                {[order.city, divisionName(order.state), order.zipCode].filter(Boolean).join(", ")}
              </span>
              {order.country && <span>{order.country}</span>}
              <span className="mt-2 text-neutralPrimary-500">{order.phone}</span>
              {order.email && <span className="text-neutralPrimary-500 break-all">{order.email}</span>}
            </address>
            {order.notes && (
              <div className="mt-4 rounded-lg bg-neutralPrimary-50 p-3 text-sm text-neutralPrimary-600">
                <span className="font-medium text-neutralPrimary-700">Note: </span>
                {order.notes}
              </div>
            )}
          </AccountCard>

          {/* ================= HELP ================= */}
          <Link
            href="/contact-us"
            className="flex items-center gap-3 rounded-2xl border border-neutralPrimary-300/70 bg-white p-4 text-sm transition-colors hover:border-greenPrimary-300"
          >
            <Headset className="h-5 w-5 shrink-0 text-greenPrimary-600" />
            <span className="text-neutralPrimary-700">
              Problem with this order?{" "}
              <span className="font-semibold text-greenPrimary-600">Contact us</span> and
              mention <span className="font-semibold">{order.orderId}</span>.
            </span>
          </Link>
        </div>
      </div>

      <CancelOrderDialog
        orderId={order.id}
        orderNumber={order.orderId}
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
      />
    </section>
  );
}

// ============ PIECES ============

function SummaryRow({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className={cn("text-neutralPrimary-500", labelClass)}>{label}</dt>
      <dd className={cn("text-right font-medium text-neutralPrimary-800", valueClass)}>{value}</dd>
    </div>
  );
}

function OrderLine({
  item,
  onBuyAgain,
}: {
  item: ICustomerOrderItem;
  onBuyAgain: () => void;
}) {
  const href = item.productSlug ? `/product-details/${item.productSlug}` : undefined;
  const image = (
    <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutralPrimary-100">
      {item.imageUrl ? (
        <Image src={orderImageUrl(item.imageUrl) as string} alt={item.productName} fill sizes="80px" unoptimized className="object-contain p-1.5" />
      ) : (
        <ImageOff className="absolute inset-0 m-auto h-6 w-6 text-neutralPrimary-300" />
      )}
    </span>
  );

  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      {href ? <Link href={href}>{image}</Link> : image}
      <div className="flex flex-1 flex-col gap-1 min-w-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          {href ? (
            <Link href={href} className="text-sm font-semibold text-neutralPrimary-800 hover:text-greenPrimary-600 line-clamp-2">
              {item.productName}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-neutralPrimary-800 line-clamp-2">{item.productName}</p>
          )}
          <p className="text-xs text-neutralPrimary-500">
            {formatBDT(item.price)} × {item.quantity}
          </p>
          {item.isAvailable ? (
            <button
              type="button"
              onClick={onBuyAgain}
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-greenPrimary-600 hover:text-greenPrimary-700 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Buy again
            </button>
          ) : (
            <p className="mt-1 text-xs text-neutralPrimary-400">Currently unavailable</p>
          )}
        </div>
        <p className="text-sm font-semibold text-neutralPrimary-800 sm:text-right">
          {formatBDT(item.total)}
        </p>
      </div>
    </li>
  );
}

/** The Steadfast consignment, with a button that asks the courier for the latest status. */
function CourierCard({ order }: { order: ICustomerOrderDetails }) {
  const { data, isFetching, refetch } = useGet<IOrderLiveStatus>(
    `/order/${order.id}/delivery-status`,
    ["customerOrderLiveStatus", String(order.id)],
    undefined,
    false,
  );
  const courierStatus = data?.liveCourierStatus ?? order.courierStatus;

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(order.trackingId ?? "");
      toast.success("Tracking ID copied", { duration: 1200 });
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <AccountCard className="p-5 sm:p-6">
      <AccountCardTitle
        icon={Truck}
        title="Delivery tracking"
        action={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(outlineButtonClass, "h-9 px-3")}
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            {isFetching ? "Checking…" : "Refresh"}
          </button>
        }
      />
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-neutralPrimary-500">Courier</dt>
          <dd className="font-medium text-neutralPrimary-800">Steadfast Courier</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutralPrimary-500">Tracking ID</dt>
          <dd className="flex items-center gap-2 font-medium text-neutralPrimary-800">
            <span className="break-all">{order.trackingId}</span>
            <button
              type="button"
              onClick={copyTrackingId}
              aria-label="Copy tracking ID"
              className="rounded-md p-1 text-neutralPrimary-400 hover:bg-neutralPrimary-100 hover:text-neutralPrimary-700 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="text-neutralPrimary-500">Courier status</dt>
          <dd>
            <span className={cn(BADGE_BASE, courierBadgeClass(courierStatus))}>
              {formatCourierStatus(courierStatus)}
            </span>
            {data && !isFetching && (
              <span className="ml-2 text-xs text-neutralPrimary-400">
                Updated just now
              </span>
            )}
          </dd>
        </div>
      </dl>
    </AccountCard>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="h-72 w-full rounded-2xl xl:col-span-2" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
