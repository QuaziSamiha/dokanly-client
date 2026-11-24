import { IInvoice } from "@/modules/order/types/order.types";
import {
  DELIVERY_METHOD_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_STYLES,
  formatDateTime,
} from "@/modules/order/utils/order.utils";
import { formatEnumString } from "@/lib/utils/string.utils";

/**
 * Everything the invoice shows, worked out once so the on-screen invoice and
 * the PDF always say the same thing. Amounts are numbers; each renderer
 * formats them (the PDF font has no ৳ glyph).
 */
export interface IInvoiceView {
  orderNumber: string;
  placedAt: string;
  orderStatus: string;
  isCancelled: boolean;

  customer: { name: string; phone: string; email?: string };
  addressLines: string[];

  items: {
    key: string | number;
    name: string;
    size?: string | null;
    sku?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  units: number;

  subtotal: number;
  coupon: { code: string; title?: string | null; amount: number } | null;
  delivery: {
    zone: string;
    estimatedDays: number;
    charge: number;
    isFree: boolean;
    /** Why delivery was free, e.g. "Free delivery on orders of 1500 or more". Amount formatted by the renderer. */
    freeMinOrderAmount: number | null;
  };
  grandTotal: number;
  savings: number;

  payment: {
    method: string;
    status: string;
    isPaid: boolean;
    transactionId?: string | null;
    paidAt?: string | null;
    /** What the customer still has to pay, and how. */
    amountDue: number;
    dueLabel: string;
  };

  trackingId?: string | null;
  notes?: string | null;
}

export function buildInvoiceView(invoice: IInvoice): IInvoiceView {
  const items = (invoice.orderItems ?? []).map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.price) || 0;
    return {
      key: item.id ?? index,
      name: item.productName,
      size: item.variantSize,
      sku: item.sku,
      quantity,
      unitPrice,
      total: unitPrice * quantity,
    };
  });

  const subtotal = Number(invoice.subtotal) || 0;
  const discount = Number(invoice.discount) || 0;
  const charge = Number(invoice.deliveryCharge) || 0;
  const grandTotal = Number(invoice.grandTotal) || 0;
  const freeMinOrderAmount =
    invoice.freeDeliveryMinOrderAmount != null ? Number(invoice.freeDeliveryMinOrderAmount) : null;
  // * Free only when the offer actually waived the charge.
  const isFree = charge === 0 && (freeMinOrderAmount !== null || !!invoice.isFreeDelivery);

  // * The division is skipped when it only repeats the city ("Dhaka, Dhaka").
  const division = invoice.state ? formatEnumString(invoice.state) : null;
  const showDivision = division && division.toLowerCase() !== invoice.city?.trim().toLowerCase();

  const isPaid = invoice.paymentStatus === "COMPLETED";
  const isCod = invoice.paymentMethod === "CASH_ON_DELIVERY";
  const isCancelled = invoice.status === "CANCELLED" || invoice.status === "REFUNDED";

  return {
    orderNumber: invoice.orderId || `#${invoice.id}`,
    placedAt: formatDateTime(invoice.createdAt),
    orderStatus: ORDER_STATUS_STYLES[invoice.status]?.label ?? formatEnumString(invoice.status ?? ""),
    isCancelled,

    customer: {
      name: [invoice.firstName, invoice.lastName].filter(Boolean).join(" "),
      phone: invoice.phone,
      email: invoice.email || undefined,
    },
    addressLines: [
      invoice.street,
      [invoice.city, showDivision ? `${division} Division` : null, invoice.zipCode]
        .filter(Boolean)
        .join(", "),
      invoice.country,
    ].filter((line): line is string => !!line),

    items,
    units: items.reduce((sum, item) => sum + item.quantity, 0),

    subtotal,
    coupon:
      discount > 0
        ? { code: invoice.couponCode || "Coupon", title: invoice.couponTitle, amount: discount }
        : null,
    delivery: {
      zone: DELIVERY_METHOD_LABELS[invoice.deliveryMethod] ?? invoice.deliveryMethod,
      estimatedDays: invoice.estimatedDays,
      charge,
      isFree,
      freeMinOrderAmount: isFree ? freeMinOrderAmount : null,
    },
    grandTotal,
    savings: discount,

    payment: {
      method: PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod,
      status: PAYMENT_STATUS_STYLES[invoice.paymentStatus]?.label ?? invoice.paymentStatus,
      isPaid,
      transactionId: invoice.transactionId,
      paidAt: invoice.paidAt,
      amountDue: isPaid || isCancelled ? 0 : grandTotal,
      dueLabel: isCancelled
        ? invoice.status === "REFUNDED"
          ? "Nothing to pay: this order was refunded"
          : "Nothing to pay: this order was cancelled"
        : isPaid
          ? "Paid in full"
          : isCod
            ? "Pay in cash when the parcel arrives"
            : "Payment pending",
    },

    trackingId: invoice.trackingId,
    notes: invoice.notes,
  };
}

export const INVOICE_COMPANY = {
  name: "Natura Care Limited",
  address: "Padma Center 32/1, Dilu Road, New Eskaton, Dhaka-1000, Bangladesh",
  email: "info@naturacarebd.com",
  phone: "+8809644556677",
  terms: [
    "We offer a 7-day return/refund policy.",
    "If a product is damaged, defective, incorrect or incomplete at delivery, contact us for a return or refund.",
  ],
};
