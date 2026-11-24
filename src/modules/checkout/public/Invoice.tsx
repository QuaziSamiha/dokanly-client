"use client";

import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import Image from "next/image";
import { BadgePercent, CheckCircle2, Truck } from "lucide-react";
import { IInvoice } from "@/modules/order/types/order.types";
import { formatBDT } from "@/modules/order/utils/order.utils";
import { INVOICE_COMPANY, buildInvoiceView } from "@/modules/order/utils/invoice.utils";
import InvoicePDF from "./InvoicePDF";
import CancelButton from "@/components/primitives/button/CancelButton";

interface IProps {
  setOpenInvoice: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceData: IInvoice;
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, sub, tone }: { label: React.ReactNode; value: string; sub?: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={tone ?? "text-neutralPrimary-600"}>{label}</p>
        {sub && <p className="text-xs text-neutralPrimary-500">{sub}</p>}
      </div>
      <p className={`shrink-0 tabular-nums ${tone ?? "text-neutralPrimary-800"}`}>{value}</p>
    </div>
  );
}

export default function Invoice({ setOpenInvoice, invoiceData }: IProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const view = useMemo(() => buildInvoiceView(invoiceData), [invoiceData]);
  const fileName = `invoice-${view.orderNumber.replace(/^#/, "")}.pdf`;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<InvoicePDF invoiceData={invoiceData} />).toBlob();
      saveAs(blob, fileName);
      setTimeout(() => {
        setOpenInvoice(false);
        window.location.href = "/";
      }, 1000); // 1 second delay to ensure download starts
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<InvoicePDF invoiceData={invoiceData} />).toBlob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (error) {
      console.error("Failed to preview PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const { delivery, coupon, payment } = view;

  return (
    <section className="flex w-full flex-col gap-4 rounded-md bg-gray-50 p-3 sm:gap-6 sm:p-6">
      <main className="flex flex-col gap-5 rounded-lg bg-white p-4 sm:gap-6 sm:p-6 lg:p-10">
        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-neutralPrimary-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <Image
            src="/images/brand/logo.png"
            alt="Natura Care"
            height={51}
            width={137}
            className="h-10 w-auto sm:h-12"
          />
          <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutralPrimary-400">Invoice</p>
            <p className="break-all font-mono text-xl font-bold text-greenPrimary-500 sm:text-2xl">
              {view.orderNumber}
            </p>
            <p className="text-sm text-neutralPrimary-500">Placed {view.placedAt}</p>
          </div>
        </header>

        {view.isCancelled && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            This order was {view.orderStatus.toLowerCase()}; nothing is due.
          </p>
        )}

        {/* Customer, address, order details */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoBlock title="Billed to">
            <p className="font-semibold text-neutralPrimary-800">{view.customer.name}</p>
            <p className="text-neutralPrimary-600">{view.customer.phone}</p>
            {view.customer.email && <p className="break-all text-neutralPrimary-600">{view.customer.email}</p>}
          </InfoBlock>
          <InfoBlock title="Deliver to">
            {view.addressLines.map((line) => (
              <p key={line} className="break-words text-neutralPrimary-600">{line}</p>
            ))}
          </InfoBlock>
          <InfoBlock title="Order details">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
              <dt className="text-neutralPrimary-500">Status</dt>
              <dd className="font-medium text-neutralPrimary-800">{view.orderStatus}</dd>
              <dt className="text-neutralPrimary-500">Payment</dt>
              <dd className="text-neutralPrimary-800">
                {payment.method} · <span className="font-medium">{payment.status}</span>
              </dd>
              {payment.transactionId && (
                <>
                  <dt className="text-neutralPrimary-500">Transaction</dt>
                  <dd className="break-all font-mono text-neutralPrimary-800">{payment.transactionId}</dd>
                </>
              )}
              <dt className="text-neutralPrimary-500">Delivery</dt>
              <dd className="text-neutralPrimary-800">
                {delivery.zone} · within {delivery.estimatedDays} days
              </dd>
              {view.trackingId && (
                <>
                  <dt className="text-neutralPrimary-500">Tracking</dt>
                  <dd className="break-all font-mono text-neutralPrimary-800">{view.trackingId}</dd>
                </>
              )}
            </dl>
          </InfoBlock>
        </section>

        {/* Items: cards on phones, table from sm up */}
        <section className="flex flex-col overflow-hidden rounded-lg border border-neutralPrimary-200 sm:hidden">
          <p className="bg-greenPrimary-500 px-3 py-2 text-xs font-semibold text-white">
            {view.items.length} item{view.items.length === 1 ? "" : "s"} · {view.units} unit{view.units === 1 ? "" : "s"}
          </p>
          <ul className="divide-y divide-neutralPrimary-100">
            {view.items.map((item, index) => (
              <li key={item.key} className="flex flex-col gap-1 px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-medium leading-snug text-neutralPrimary-800">
                    <span className="mr-1 text-neutralPrimary-400">{index + 1}.</span>
                    {item.name}
                  </p>
                  <p className="shrink-0 font-semibold tabular-nums text-neutralPrimary-800">{formatBDT(item.total)}</p>
                </div>
                <p className="text-xs text-neutralPrimary-500">
                  {item.quantity} × {formatBDT(item.unitPrice)}
                  {item.size && ` · ${item.size}`}
                  {item.sku && <span className="font-mono"> · {item.sku}</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="hidden overflow-x-auto rounded-lg border border-neutralPrimary-200 sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-greenPrimary-500 text-left text-white">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 text-center font-semibold">Qty</th>
                <th className="px-4 py-3 text-right font-semibold">Unit price</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="text-neutralPrimary-700">
              {view.items.map((item, index) => (
                <tr key={item.key} className={index % 2 !== 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 align-top text-neutralPrimary-400">{index + 1}</td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-neutralPrimary-800">{item.name}</p>
                    {(item.size || item.sku) && (
                      <p className="text-xs text-neutralPrimary-500">
                        {item.size}
                        {item.size && item.sku && " · "}
                        {item.sku && <span className="font-mono">SKU {item.sku}</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center align-top tabular-nums">{item.quantity}</td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">{formatBDT(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-neutralPrimary-800">
                    {formatBDT(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals + notes */}
        <section className="flex flex-col-reverse gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            {view.notes && (
              <InfoBlock title="Order note">
                <p className="whitespace-pre-line break-words text-neutralPrimary-600">{view.notes}</p>
              </InfoBlock>
            )}
            <InfoBlock title="Terms & conditions">
              {INVOICE_COMPANY.terms.map((line) => (
                <p key={line} className="text-xs text-neutralPrimary-500">{line}</p>
              ))}
              <p className="text-xs text-neutralPrimary-500">
                {INVOICE_COMPANY.email} · {INVOICE_COMPANY.phone}
              </p>
            </InfoBlock>
          </div>

          <div className="flex w-full flex-col gap-2.5 text-sm md:w-1/2 md:max-w-sm">
            <Row
              label="Subtotal"
              sub={`${view.units} unit${view.units === 1 ? "" : "s"}`}
              value={formatBDT(view.subtotal)}
            />
            {coupon && (
              <Row
                tone="text-emerald-700"
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <BadgePercent size={14} />
                    Coupon <span className="font-mono font-semibold">{coupon.code}</span>
                  </span>
                }
                sub={coupon.title}
                value={`−${formatBDT(coupon.amount)}`}
              />
            )}
            <Row
              tone={delivery.isFree ? "text-emerald-700" : undefined}
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Truck size={14} />
                  Delivery ({delivery.zone})
                </span>
              }
              sub={
                delivery.isFree
                  ? delivery.freeMinOrderAmount !== null
                    ? `Free delivery on orders of ${formatBDT(delivery.freeMinOrderAmount)} or more`
                    : "Free delivery offer applied"
                  : undefined
              }
              value={delivery.isFree ? "Free" : formatBDT(delivery.charge)}
            />
            <div className="mt-1 flex items-center justify-between gap-3 rounded-md bg-greenPrimary-500 px-4 py-2.5 font-semibold text-white">
              <p>Grand total</p>
              <p className="tabular-nums">{formatBDT(view.grandTotal)}</p>
            </div>
            {view.savings > 0 && (
              <p className="text-right text-xs font-medium text-emerald-700">
                You saved {formatBDT(view.savings)} on this order
              </p>
            )}
            <div className="flex items-start justify-between gap-3 rounded-md border border-dashed border-neutralPrimary-300 px-4 py-2.5">
              <div className="min-w-0">
                <p className="font-semibold text-neutralPrimary-800">
                  {payment.isPaid ? "Amount paid" : "Amount due"}
                </p>
                <p className="flex items-center gap-1 text-xs text-neutralPrimary-500">
                  {payment.isPaid && <CheckCircle2 size={12} className="text-emerald-600" />}
                  {payment.dueLabel}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-neutralPrimary-800">
                {formatBDT(payment.isPaid ? view.grandTotal : payment.amountDue)}
              </p>
            </div>
          </div>
        </section>

        <p className="text-sm font-semibold text-greenPrimary-500">Thank you for your purchase</p>

        <footer className="border-t border-neutralPrimary-200 pt-4 text-sm">
          <p className="font-semibold text-neutralPrimary-800">{INVOICE_COMPANY.name} · Head office</p>
          <p className="text-neutralPrimary-600">{INVOICE_COMPANY.address}</p>
        </footer>
      </main>

      <section className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <CancelButton onClick={() => setOpenInvoice(false)} />
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className="cursor-pointer rounded-lg border border-blueSecondary-500 px-5 py-2.5 text-blueSecondary-500 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Preview PDF"}
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="cursor-pointer rounded-lg bg-blueSecondary-500 px-5 py-2.5 text-white transition-colors hover:bg-blueSecondary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Download PDF"}
        </button>
      </section>
    </section>
  );
}
