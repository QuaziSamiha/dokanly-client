"use client";

import React, { useMemo, useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  Info,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";
import { IModal } from "@/types";
import { useGet } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { useConfirm } from "@/hooks/useConfirm";
import { IOrder } from "@/modules/order/types/order.types";
import { UpdateOrderFormType, updateOrderSchema } from "@/modules/order/schemas/order-update.schema";
import { ORDER_STATUS } from "@/modules/order/constants/order.constants";
import {
  BADGE_BASE,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  customerName,
  formatBDT,
  formatDateTime,
} from "@/modules/order/utils/order.utils";
import CustomerPersonalInformation from "./edit-placed-order-form/CustomerPersonalInformation";
import OrderDeliveryAddress from "./edit-placed-order-form/OrderDeliveryAddress";
import EditOrderItems from "./edit-placed-order-form/EditOrderItems";
import StatusPicker, { IStatusOption } from "./edit-placed-order-form/StatusPicker";

const FORM_ID = "edit-order-form";

/** The server refuses to move these back to PENDING. */
const NO_RETURN_TO_PENDING = ["CONFIRMED", "CANCELLED"];

function Card({
  icon,
  title,
  description,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutralPrimary-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 text-greenPrimary-500">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-neutralPrimary-800 sm:text-base">{title}</h3>
            {description && <p className="text-xs text-neutralPrimary-500">{description}</p>}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

const ChangedBadge = () => (
  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
    Edited
  </span>
);

export default function EditPlacedOrder({ data, refetch, isLoading, setOpen }: IModal) {
  const order = data as IOrder;
  const items = useMemo(() => order?.orderItems ?? [], [order]);

  const [removed, setRemoved] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // * Current shop stock, so quantities can't be raised past what the server allows.
  const productIds = items.map((item) => item.productId).filter((id): id is number => id != null);
  const { data: stockRows } = useGet<{ id: number; quantity: number }[]>(
    `/products/prices?ids=${productIds.join(",")}`,
    ["getOrderItemStock", productIds.join(",")],
    undefined,
    productIds.length > 0,
  );
  const stockByProductId = useMemo(
    () =>
      stockRows
        ? Object.fromEntries(stockRows.map((row) => [row.id, Number(row.quantity)]))
        : undefined,
    [stockRows],
  );

  //* =============== REACT HOOK FORM METHODS ===========
  const methods = useForm<UpdateOrderFormType>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      firstName: order?.firstName,
      lastName: order?.lastName ?? "",
      userEmail: order?.email ?? "",
      phone: order?.phone,
      orderStatus: order?.status,
      paymentStatus: order?.paymentStatus,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, dirtyFields },
  } = methods;
  const [orderStatus, paymentStatus] = watch(["orderStatus", "paymentStatus"]);

  // * ========== WHAT CHANGED ==========
  const itemsToUpdate = useMemo(
    () =>
      Object.entries(quantities)
        .map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity }))
        .filter(
          ({ itemId, quantity }) =>
            !removed.includes(itemId) &&
            quantity !== Number(items.find((item) => item.id === itemId)?.quantity),
        ),
    [quantities, removed, items],
  );
  const customerChanged = ["firstName", "lastName", "userEmail", "phone"].some(
    (key) => dirtyFields[key as keyof UpdateOrderFormType],
  );
  const itemsChanged = itemsToUpdate.length > 0 || removed.length > 0;
  const changeCount =
    Object.values(dirtyFields).filter(Boolean).length + itemsToUpdate.length + removed.length;
  const hasChanges = isDirty || itemsChanged;

  // * ========== NEW TOTALS (same maths as the server) ==========
  const preview = useMemo(() => {
    const subtotal = items
      .filter((item) => !removed.includes(item.id))
      .reduce(
        (sum, item) => sum + Number(item.price) * (quantities[item.id] ?? Number(item.quantity)),
        0,
      );
    const oldSubtotal = Number(order?.subtotal) || 0;
    const oldDiscount = Number(order?.discount) || 0;
    // * The coupon keeps the same percentage of the subtotal.
    const discount = oldDiscount > 0 && oldSubtotal > 0 ? (subtotal * oldDiscount) / oldSubtotal : 0;
    const delivery = Number(order?.deliveryCharge) || 0;
    return { subtotal, discount, delivery, grandTotal: subtotal + delivery - discount };
  }, [items, removed, quantities, order]);

  // * ========== STATUS OPTIONS ==========
  const statusOptions: IStatusOption[] = useMemo(() => {
    const values = ORDER_STATUS.map((s) => s.id);
    // * Keep the order's own status visible even when it isn't one the form offers.
    if (order?.status && !values.includes(order.status)) values.splice(1, 0, order.status);
    return values.map((value) => {
      const style = ORDER_STATUS_STYLES[value as IOrder["status"]];
      // * Cancelling restocks the items, so the server won't reopen a cancelled order.
      const reopening = order?.status === "CANCELLED" && value !== "CANCELLED";
      const blocked = value === "PENDING" && NO_RETURN_TO_PENDING.includes(order?.status);
      return {
        value,
        label: style?.label ?? value,
        hint: style?.hint,
        dot: style?.dot ?? "bg-neutralPrimary-400",
        disabled: reopening || blocked,
        disabledReason: reopening
          ? "A cancelled order can't be reopened; its items are back in stock"
          : blocked
            ? `A ${order.status.toLowerCase()} order can't go back to pending`
            : undefined,
      };
    });
  }, [order]);

  const paymentOptions: IStatusOption[] = Object.entries(PAYMENT_STATUS_STYLES).map(
    ([value, style]) => ({ value, label: style.label, dot: style.dot }),
  );

  const sendsToCourier =
    orderStatus === "CONFIRMED" &&
    order?.status !== "CONFIRMED" &&
    order?.paymentMethod === "CASH_ON_DELIVERY" &&
    !order?.trackingId;
  const isCancelling = orderStatus === "CANCELLED" && order?.status !== "CANCELLED";
  // * The server refuses item changes on an order that is or becomes cancelled.
  const itemsLocked = order?.status === "CANCELLED" || isCancelling;

  // * ========== SAVE ==========
  const { confirm } = useConfirm();
  const { mutate: updateOrder, isPending } = usePatch<IOrder>((response) => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      setOpen?.(false);
      refetch?.();
    }
  });

  const onSubmit: SubmitHandler<UpdateOrderFormType> = async (values) => {
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }
    if (preview.grandTotal <= 0) {
      toast.error("The order total must be more than ৳0.");
      return;
    }
    if (
      isCancelling &&
      !(await confirm({
        title: `Cancel order ${order.orderId}?`,
        description: "All of its items will be put back into stock. A cancelled order can't be reopened.",
        confirmLabel: "Cancel order",
        cancelLabel: "Keep order",
        variant: "warning",
      }))
    ) {
      return;
    }

    const orderPayload: Record<string, unknown> = {};
    if (dirtyFields.firstName) orderPayload.firstName = values.firstName;
    if (dirtyFields.lastName) orderPayload.lastName = values.lastName;
    if (dirtyFields.userEmail) orderPayload.email = values.userEmail;
    if (dirtyFields.phone) orderPayload.phone = values.phone;
    if (dirtyFields.orderStatus) orderPayload.status = values.orderStatus;
    if (dirtyFields.paymentStatus) orderPayload.paymentStatus = values.paymentStatus;
    if (itemsToUpdate.length > 0) orderPayload.itemsToUpdate = itemsToUpdate;
    if (removed.length > 0) orderPayload.itemsToRemove = removed;

    updateOrder({ endpoint: `order/update-order/${order.id}`, data: orderPayload });
  };

  const discardAll = () => {
    reset();
    setRemoved([]);
    setQuantities({});
  };

  if (!order) return null;

  const status = ORDER_STATUS_STYLES[order.status];
  const payment = PAYMENT_STATUS_STYLES[order.paymentStatus];

  return (
    <FormProvider {...methods}>
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutralPrimary-100 pb-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
              <Pencil size={12} /> Edit order
            </p>
            <h2 className="break-all font-mono text-xl font-bold text-neutralPrimary-800">
              {order.orderId}
            </h2>
            <p className="text-sm text-neutralPrimary-500">
              {customerName(order)} · placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {status && (
              <span className={`${BADGE_BASE} ${status.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            )}
            {payment && (
              <span className={`${BADGE_BASE} ${payment.badge}`}>{payment.label}</span>
            )}
          </div>
        </div>

        {/* Status */}
        <Card
          icon={<Tag size={18} />}
          title="Status"
          description="Every change is recorded in the order's status history."
          badge={(dirtyFields.orderStatus || dirtyFields.paymentStatus) && <ChangedBadge />}
        >
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="orderStatus"
              render={({ field }) => (
                <StatusPicker
                  label="Order status"
                  value={field.value}
                  original={order.status}
                  options={statusOptions}
                  onChange={(value) => {
                    // * Item edits can't be sent with a cancel; drop them.
                    if (value === "CANCELLED") {
                      setRemoved([]);
                      setQuantities({});
                    }
                    field.onChange(value);
                  }}
                />
              )}
            />
            {sendsToCourier && (
              <p className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
                <Truck size={16} className="mt-0.5 shrink-0" />
                Saving sends this order to Steadfast for pickup. If Steadfast refuses it, nothing is saved.
              </p>
            )}
            {isCancelling && (
              <p className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Cancelling puts all of this order&apos;s items back into stock. A cancelled order can&apos;t be reopened.
              </p>
            )}
            <Controller
              control={control}
              name="paymentStatus"
              render={({ field }) => (
                <StatusPicker
                  label="Payment status"
                  value={field.value}
                  original={order.paymentStatus}
                  options={paymentOptions}
                  onChange={field.onChange}
                />
              )}
            />
            {paymentStatus === "COMPLETED" && order.paymentStatus !== "COMPLETED" && (
              <p className="flex items-start gap-2 text-xs text-neutralPrimary-500">
                <Info size={14} className="mt-px shrink-0" />
                Marking as paid records the order as paid now.
              </p>
            )}
          </div>
        </Card>

        {/* Items */}
        <Card
          icon={<Package size={18} />}
          title="Items"
          description={
            itemsLocked
              ? "A cancelled order's items can't be changed."
              : "Stock and inventory history follow every change."
          }
          badge={itemsChanged && <ChangedBadge />}
        >
          <EditOrderItems
            locked={itemsLocked}
            items={items}
            quantities={quantities}
            removed={removed}
            stockByProductId={stockByProductId}
            onQuantityChange={(itemId, quantity) =>
              setQuantities((current) => ({ ...current, [itemId]: quantity }))
            }
            onRemove={(itemId) => setRemoved((current) => [...new Set([...current, itemId])])}
            onRestore={(itemId) => setRemoved((current) => current.filter((id) => id !== itemId))}
          />

          {/* Totals: before → after */}
          <dl className="mt-3 flex flex-col gap-1.5 rounded-lg bg-neutralPrimary-50 p-3 text-sm">
            {[
              { label: "Subtotal", before: Number(order.subtotal), after: preview.subtotal },
              { label: "Delivery", before: Number(order.deliveryCharge), after: preview.delivery },
              ...(Number(order.discount) > 0
                ? [{ label: `Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`, before: -Number(order.discount), after: -preview.discount }]
                : []),
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-3">
                <dt className="text-neutralPrimary-500">{row.label}</dt>
                <dd className="tabular-nums text-neutralPrimary-700">
                  {itemsChanged && Math.abs(row.before - row.after) > 0.004 && (
                    <span className="mr-2 text-neutralPrimary-400 line-through">
                      {row.before < 0 ? "−" : ""}
                      {formatBDT(Math.abs(row.before))}
                    </span>
                  )}
                  {row.after < 0 ? "−" : ""}
                  {formatBDT(Math.abs(row.after))}
                </dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-3 border-t border-neutralPrimary-200 pt-2 font-semibold">
              <dt className="text-neutralPrimary-800">Grand total</dt>
              <dd className="tabular-nums text-neutralPrimary-800">
                {itemsChanged && (
                  <span className="mr-2 font-normal text-neutralPrimary-400 line-through">
                    {formatBDT(order.grandTotal)}
                  </span>
                )}
                <span className={itemsChanged ? "text-amber-700" : ""}>{formatBDT(preview.grandTotal)}</span>
              </dd>
            </div>
          </dl>
          {Number(order.discount) > 0 && itemsChanged && (
            <p className="mt-2 text-xs text-neutralPrimary-500">
              The coupon keeps the same percentage of the subtotal.
            </p>
          )}
        </Card>

        {/* Customer + address */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card icon={<UserRound size={18} />} title="Customer" badge={customerChanged && <ChangedBadge />}>
            <CustomerPersonalInformation isLoading={!!isLoading} />
          </Card>
          <Card icon={<MapPin size={18} />} title="Delivery address">
            <OrderDeliveryAddress order={order} />
          </Card>
        </div>

        {/* Sticky footer */}
        <div className="sticky -bottom-6 z-10 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t border-neutralPrimary-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-neutralPrimary-500 sm:text-left">
            {hasChanges ? (
              <span className="font-medium text-amber-700">
                {changeCount} unsaved change{changeCount === 1 ? "" : "s"}
              </span>
            ) : (
              "No changes yet"
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={hasChanges ? discardAll : () => setOpen?.(false)}
              disabled={isPending}
              className="h-10 flex-1 cursor-pointer rounded-lg border border-neutralPrimary-300 px-4 text-sm font-semibold text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50 disabled:opacity-50 sm:flex-none"
            >
              {hasChanges ? "Discard" : "Close"}
            </button>
            <button
              type="submit"
              disabled={!hasChanges || isPending}
              className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-greenPrimary-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
