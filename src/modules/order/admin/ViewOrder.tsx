"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  Check,
  Clock,
  Copy,
  CreditCard,
  Download,
  History,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Radar,
  ReceiptText,
  StickyNote,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import CancelButton from "@/components/primitives/button/CancelButton";
import { useGet } from "@/hooks/api/useGet";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import {
  IOrder,
  IOrderDetails,
  IOrderLiveStatus,
  IOrderStatusHistory,
} from "@/modules/order/types/order.types";
import {
  BADGE_BASE,
  DELIVERY_METHOD_LABELS,
  ORDER_FLOW,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
  courierBadgeClass,
  customerName,
  formatBDT,
  formatCourierStatus,
  formatDateTime,
  fullAddress,
  initials,
  itemCount,
  timeAgo,
} from "@/modules/order/utils/order.utils";
import { ItemThumb } from "./order.columns";

// Staggered fade/slide-in for the modal's blocks (tw-animate-css), as in ViewProduct.
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

const copy = (text: string, what: string) => {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success(`${what} copied`))
    .catch(() => toast.error(`Couldn't copy the ${what.toLowerCase()}`));
};

// ============ BUILDING BLOCKS ============

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
    <div className="flex min-w-0 items-start gap-3 py-2">
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

function PriceLine({
  label,
  value,
  tone = "default",
  strong = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "default" | "good" | "muted";
  strong?: boolean;
}) {
  const toneClass = {
    default: "text-neutralPrimary-700",
    good: "text-success-600",
    muted: "text-neutralPrimary-400",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-neutralPrimary-500">{label}</span>
      <span
        className={`text-sm tabular-nums ${strong ? "text-base font-bold" : "font-medium"} ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="italic text-neutralPrimary-400">{children}</span>
);

function CopyButton({ text, what }: { text: string; what: string }) {
  return (
    <button
      type="button"
      onClick={() => copy(text, what)}
      aria-label={`Copy ${what.toLowerCase()}`}
      className="cursor-pointer rounded p-1 text-neutralPrimary-400 transition-colors hover:bg-neutralPrimary-100 hover:text-greenPrimary-600"
    >
      <Copy size={13} />
    </button>
  );
}

// ============ PROGRESS ============

function OrderProgress({ order }: { order: IOrder }) {
  const stopped = order.status === "CANCELLED" || order.status === "REFUNDED";
  if (stopped) {
    const style = ORDER_STATUS_STYLES[order.status];
    return (
      <div
        style={enterDelay(80)}
        className={`${ENTER} flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700`}
      >
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">This order was {style.label.toLowerCase()}.</span>{" "}
          {order.status === "CANCELLED"
            ? "It will not be delivered."
            : "The payment was returned to the customer."}
        </p>
      </div>
    );
  }

  const current = Math.max(ORDER_FLOW.indexOf(order.status), 0);
  return (
    <ol
      style={enterDelay(80)}
      className={`${ENTER} grid grid-cols-5 rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4`}
      aria-label="Order progress"
    >
      {ORDER_FLOW.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="relative flex flex-col items-center gap-1.5 text-center">
            {index > 0 && (
              <span
                className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${
                  index <= current ? "bg-greenPrimary-500" : "bg-neutralPrimary-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                done
                  ? "bg-greenPrimary-500 text-white"
                  : active
                    ? "bg-greenPrimary-600 text-white ring-4 ring-greenPrimary-500/20"
                    : "bg-neutralPrimary-100 text-neutralPrimary-400"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={14} /> : index + 1}
            </span>
            <span
              className={`text-[11px] font-medium sm:text-xs ${
                active ? "text-greenPrimary-700" : done ? "text-neutralPrimary-600" : "text-neutralPrimary-400"
              }`}
            >
              {ORDER_STATUS_STYLES[step].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ============ HISTORY ============

function StatusTimeline({
  history,
  isLoading,
}: {
  history?: IOrderStatusHistory[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-neutralPrimary-50" />
        ))}
      </div>
    );
  }
  if (!history?.length) {
    return <p className="text-sm italic text-neutralPrimary-400">No history recorded.</p>;
  }

  // Newest first: the latest change is what the admin usually looks for.
  const entries = [...history].reverse();
  return (
    <ol className="relative space-y-4 border-l border-neutralPrimary-200 pl-5">
      {entries.map((entry, index) => {
        const style = ORDER_STATUS_STYLES[entry.status];
        return (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                index === 0 ? style?.dot ?? "bg-greenPrimary-500" : "bg-neutralPrimary-300"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              {style && (
                <span className={`${BADGE_BASE} ${style.badge}`}>{style.label}</span>
              )}
              <span className="text-xs text-neutralPrimary-400" title={formatDateTime(entry.createdAt)}>
                {formatDateTime(entry.createdAt)}
              </span>
            </div>
            {entry.notes && (
              <p className="mt-1 text-sm text-neutralPrimary-600 [overflow-wrap:anywhere]">
                {entry.notes}
              </p>
            )}
            <p className="mt-0.5 text-xs text-neutralPrimary-400">
              {entry.changedByUser
                ? `by ${entry.changedByUser.name}`
                : entry.changedBy
                  ? `by user #${entry.changedBy}`
                  : "by the system / customer"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

// ============ VIEW ============

export default function ViewOrder({
  data,
  onClose,
  onEdit,
  onDownloadInvoice,
  onChanged,
}: {
  data?: IOrder;
  onClose: () => void;
  onEdit?: (order: IOrder) => void;
  onDownloadInvoice?: (order: IOrder) => void;
  /** Called when a live courier check updated the stored status. */
  onChanged?: () => void;
}) {
  const { data: details, isLoading: isDetailsLoading } = useGet<IOrderDetails>(
    `/order/order-details/${data?.id}`,
    ["getOrderDetails", String(data?.id)],
    undefined,
    !!data?.id,
  );
  const [live, setLive] = useState<IOrderLiveStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <Package size={32} />
        No order details available.
      </div>
    );
  }

  // The list row shows instantly; the details call adds the status history.
  const order: IOrder = { ...data, ...(details ?? {}), ...(live ?? {}) };
  const status = ORDER_STATUS_STYLES[order.status];
  const payment = PAYMENT_STATUS_STYLES[order.paymentStatus];
  const count = itemCount(order);
  const isGuest = !order.customerId;
  const freeDelivery = order.isFreeDelivery && Number(order.deliveryCharge) === 0;

  const checkCourier = async () => {
    setIsChecking(true);
    try {
      const response = (await axiosInstance.get(
        `/order/${order.id}/delivery-status`,
      )) as unknown as { data: IOrderLiveStatus };
      setLive(response.data);
      if (response.data?.courierStatus !== data.courierStatus) onChanged?.();
      toast.success(
        `Steadfast says: ${formatCourierStatus(response.data?.liveCourierStatus)}`,
      );
    } catch {
      toast.error("Couldn't reach Steadfast. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 p-4 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 sm:p-5`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
              Order
            </p>
            <div className="flex items-center gap-1">
              <h2 className="break-all font-mono text-xl font-bold text-neutralPrimary-800 sm:text-2xl">
                {order.orderId}
              </h2>
              <CopyButton text={order.orderId} what="Order number" />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-neutralPrimary-500">
              <Clock size={14} />
              {formatDateTime(order.createdAt)}
              <span className="text-neutralPrimary-400">· {timeAgo(order.createdAt)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {status && (
                <span className={`${BADGE_BASE} ${status.badge}`} title={status.hint}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              )}
              {payment && (
                <span className={`${BADGE_BASE} ${payment.badge}`}>
                  <CreditCard size={11} />
                  {payment.label}
                </span>
              )}
              {(order.trackingId || order.courierStatus) && (
                <span className={`${BADGE_BASE} ${courierBadgeClass(order.courierStatus)}`}>
                  <Truck size={11} />
                  {formatCourierStatus(order.courierStatus)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
                Grand total
              </p>
              <p className="text-3xl font-extrabold tabular-nums text-greenPrimary-700">
                {formatBDT(order.grandTotal)}
              </p>
              <p className="text-xs text-neutralPrimary-500">
                {count} item{count === 1 ? "" : "s"} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(data)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-greenPrimary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-greenPrimary-700"
                >
                  <Pencil size={14} /> Edit
                </button>
              )}
              {onDownloadInvoice && (
                <button
                  type="button"
                  onClick={() => onDownloadInvoice(order)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-neutralPrimary-300 bg-white px-3 text-sm font-medium text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50"
                >
                  <Download size={14} /> Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderProgress order={order} />

      {/* Customer + address */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section
          delay={140}
          icon={<UserRound size={16} />}
          title="Customer"
          aside={
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isGuest
                  ? "bg-neutralPrimary-100 text-neutralPrimary-500"
                  : "bg-greenPrimary-950 text-greenPrimary-700"
              }`}
            >
              {isGuest ? "Guest checkout" : "Registered customer"}
            </span>
          }
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-sm font-semibold text-blueSecondary-600">
              {initials(order)}
            </span>
            <p className="min-w-0 break-words text-base font-semibold text-neutralPrimary-800">
              {customerName(order)}
            </p>
          </div>
          <div className="divide-y divide-neutralPrimary-100">
            <DetailRow icon={<Phone size={15} />} label="Phone">
              <span className="inline-flex items-center gap-1">
                <a href={`tel:${order.phone}`} className="hover:text-greenPrimary-600">
                  {order.phone}
                </a>
                <CopyButton text={order.phone} what="Phone number" />
              </span>
            </DetailRow>
            <DetailRow icon={<Mail size={15} />} label="Email">
              {order.email ? (
                <a href={`mailto:${order.email}`} className="hover:text-greenPrimary-600">
                  {order.email}
                </a>
              ) : (
                <Muted>Not given</Muted>
              )}
            </DetailRow>
          </div>
        </Section>

        <Section
          delay={200}
          icon={<MapPin size={16} />}
          title="Delivery"
          aside={<CopyButton text={`${customerName(order)}, ${order.phone}\n${fullAddress(order)}`} what="Address" />}
        >
          <p className="mb-2 text-sm leading-relaxed text-neutralPrimary-700 [overflow-wrap:anywhere]">
            {order.street}
            <br />
            {[order.city, order.zipCode].filter(Boolean).join(" ")}
            {(order.state || order.country) && (
              <>
                <br />
                {[order.state, order.country].filter(Boolean).join(", ")}
              </>
            )}
          </p>
          <div className="divide-y divide-neutralPrimary-100">
            <DetailRow icon={<Truck size={15} />} label="Zone">
              {DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
              <span className="text-neutralPrimary-400"> · within {order.estimatedDays} days</span>
            </DetailRow>
            {order.deliveredAt && (
              <DetailRow icon={<Check size={15} />} label="Delivered">
                {formatDateTime(order.deliveredAt)}
              </DetailRow>
            )}
          </div>
        </Section>
      </div>

      {/* Items */}
      <Section
        delay={260}
        icon={<Package size={16} />}
        title={`Items (${count})`}
      >
        <ul className="divide-y divide-neutralPrimary-100">
          {order.orderItems?.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <ItemThumb item={item} size={48} />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium text-neutralPrimary-800">
                  {item.productName}
                </p>
                <p className="text-xs text-neutralPrimary-500">
                  {item.sku && <span className="font-mono">{item.sku} · </span>}
                  {formatBDT(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-neutralPrimary-800">
                {formatBDT(item.total)}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Payment + courier */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section delay={320} icon={<Wallet size={16} />} title="Payment">
          <div className="divide-y divide-neutralPrimary-100">
            <div>
              <PriceLine label="Subtotal" value={formatBDT(order.subtotal)} />
              <PriceLine
                label={
                  <span className="inline-flex items-center gap-1.5">
                    Delivery
                    {freeDelivery && (
                      <span className="rounded-full bg-success-100 px-1.5 py-px text-[10px] font-semibold text-success-600">
                        Free
                      </span>
                    )}
                  </span>
                }
                value={freeDelivery ? "৳0" : formatBDT(order.deliveryCharge)}
                tone={freeDelivery ? "good" : "default"}
              />
              {Number(order.discount) > 0 && (
                <PriceLine
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <BadgePercent size={13} />
                      Coupon {order.couponCode && (
                        <span className="font-mono text-xs font-semibold">{order.couponCode}</span>
                      )}
                    </span>
                  }
                  value={`−${formatBDT(order.discount)}`}
                  tone="good"
                />
              )}
            </div>
            <PriceLine label="Grand total" value={formatBDT(order.grandTotal)} strong />
            <div className="pt-1">
              <DetailRow icon={<CreditCard size={15} />} label="Method">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </DetailRow>
              <DetailRow icon={<ReceiptText size={15} />} label="Status">
                {payment?.label ?? order.paymentStatus}
                {order.paidAt && (
                  <span className="text-neutralPrimary-400"> · {formatDateTime(order.paidAt)}</span>
                )}
              </DetailRow>
              {order.transactionId && (
                <DetailRow icon={<ReceiptText size={15} />} label="Transaction">
                  <span className="font-mono">{order.transactionId}</span>
                </DetailRow>
              )}
            </div>
          </div>
        </Section>

        <Section
          delay={380}
          icon={<Truck size={16} />}
          title="Courier (Steadfast)"
          aside={
            order.trackingId && (
              <button
                type="button"
                onClick={checkCourier}
                disabled={isChecking}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutralPrimary-300 px-2.5 text-xs font-medium text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50 disabled:cursor-wait disabled:opacity-60"
              >
                <Radar size={13} className={isChecking ? "animate-spin" : ""} />
                {isChecking ? "Checking…" : "Check live status"}
              </button>
            )
          }
        >
          {order.trackingId ? (
            <div className="divide-y divide-neutralPrimary-100">
              <DetailRow icon={<Package size={15} />} label="Consignment">
                <span className="inline-flex items-center gap-1 font-mono">
                  {order.trackingId}
                  <CopyButton text={order.trackingId} what="Tracking ID" />
                </span>
              </DetailRow>
              <DetailRow icon={<Truck size={15} />} label="Status">
                <span className={`${BADGE_BASE} ${courierBadgeClass(order.courierStatus)}`}>
                  {formatCourierStatus(order.courierStatus)}
                </span>
              </DetailRow>
              {live && (
                <DetailRow icon={<Radar size={15} />} label="Live check">
                  {formatCourierStatus(live.liveCourierStatus)}
                  <span className="text-neutralPrimary-400"> · just now</span>
                </DetailRow>
              )}
              {order.lastTrackingMsg && (
                <DetailRow icon={<StickyNote size={15} />} label="Last update">
                  {order.lastTrackingMsg}
                </DetailRow>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutralPrimary-500">
              {order.paymentMethod === "CASH_ON_DELIVERY"
                ? order.status === "PENDING"
                  ? "Not sent yet. Confirming this order sends it to Steadfast for pickup."
                  : "No consignment was created for this order."
                : "Online-paid orders are not sent to Steadfast automatically."}
            </p>
          )}
        </Section>
      </div>

      {order.notes && (
        <Section delay={420} icon={<StickyNote size={16} />} title="Notes">
          <p className="whitespace-pre-line text-sm text-neutralPrimary-600 [overflow-wrap:anywhere]">
            {order.notes}
          </p>
        </Section>
      )}

      <Section delay={460} icon={<History size={16} />} title="Status history">
        <StatusTimeline history={details?.statusHistory} isLoading={isDetailsLoading} />
      </Section>

      <div className="flex justify-end pt-2">
        <CancelButton onClick={onClose} label="Close" />
      </div>
    </div>
  );
}
