import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { IInvoice } from "@/modules/order/types/order.types";
import { INVOICE_COMPANY, buildInvoiceView } from "@/modules/order/utils/invoice.utils";

// * Wrap whole words only; react-pdf otherwise hyphenates product names ("Sham-poo").
Font.registerHyphenationCallback((word) => [word]);

const GREEN = "#677c22"; // greenPrimary-500
const EMERALD = "#047857";
const ROSE = "#be123c";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

// * Helvetica has no ৳ glyph, so the PDF writes "Tk".
const tk = (value: number) =>
  `Tk ${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", color: TEXT, padding: 36, paddingBottom: 60 },
  bold: { fontFamily: "Helvetica-Bold" },
  mono: { fontFamily: "Courier" },
  muted: { color: MUTED },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logo: { width: 120, height: 45 },
  headerRight: { alignItems: "flex-end", gap: 2 },
  invoiceLabel: { fontSize: 9, color: MUTED, letterSpacing: 2 },
  orderNumber: { fontSize: 18, fontFamily: "Helvetica-Bold", color: GREEN },

  banner: { marginTop: 12, padding: 8, backgroundColor: "#FFF1F2", color: ROSE, borderRadius: 4 },

  infoRow: { flexDirection: "row", gap: 16, marginTop: 16 },
  infoBlock: { flex: 1, gap: 2 },
  infoTitle: { fontSize: 8, color: MUTED, letterSpacing: 1, marginBottom: 2 },
  detailLine: { flexDirection: "row" },
  detailLabel: { width: 62, color: MUTED },
  detailValue: { flex: 1 },

  table: { marginTop: 18, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  th: { flexDirection: "row", backgroundColor: GREEN, color: "#FFFFFF", fontFamily: "Helvetica-Bold" },
  odd: { backgroundColor: "#F9FAFB" },
  cNo: { width: "6%", padding: 6, textAlign: "center" },
  cItem: { width: "46%", padding: 6 },
  cQty: { width: "10%", padding: 6, textAlign: "center" },
  cUnit: { width: "19%", padding: 6, textAlign: "right" },
  cTotal: { width: "19%", padding: 6, textAlign: "right" },
  itemSub: { fontSize: 8, color: MUTED, marginTop: 2 },

  summary: { flexDirection: "row", justifyContent: "space-between", gap: 24, marginTop: 18 },
  left: { width: "48%", gap: 12 },
  right: { width: "46%", gap: 6 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  lineSub: { fontSize: 8, color: MUTED, marginTop: 1 },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: GREEN,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
    borderRadius: 3,
  },
  due: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 3,
  },
  small: { fontSize: 8, color: MUTED },

  thanks: { marginTop: 20, color: GREEN, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 24,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
});

interface InvoicePDFProps {
  invoiceData: IInvoice;
}

const InvoicePDF = ({ invoiceData }: InvoicePDFProps) => {
  const view = buildInvoiceView(invoiceData);
  const { delivery, coupon, payment } = view;

  return (
    <Document title={`Invoice ${view.orderNumber}`} author={INVOICE_COMPANY.name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/images/brand/logo.png" style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.orderNumber}>{view.orderNumber}</Text>
            <Text style={styles.muted}>Placed {view.placedAt}</Text>
          </View>
        </View>

        {view.isCancelled && (
          <Text style={styles.banner}>
            This order was {view.orderStatus.toLowerCase()}; nothing is due.
          </Text>
        )}

        {/* Customer, address, order details */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>BILLED TO</Text>
            <Text style={styles.bold}>{view.customer.name}</Text>
            <Text>{view.customer.phone}</Text>
            {view.customer.email && <Text>{view.customer.email}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>DELIVER TO</Text>
            {view.addressLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
          <View style={[styles.infoBlock, { flex: 1.2 }]}>
            <Text style={styles.infoTitle}>ORDER DETAILS</Text>
            <View style={styles.detailLine}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, styles.bold]}>{view.orderStatus}</Text>
            </View>
            <View style={styles.detailLine}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailValue}>
                {payment.method} · {payment.status}
              </Text>
            </View>
            {payment.transactionId && (
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Transaction</Text>
                <Text style={[styles.detailValue, styles.mono]}>{payment.transactionId}</Text>
              </View>
            )}
            <View style={styles.detailLine}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>
                {delivery.zone} · within {delivery.estimatedDays} days
              </Text>
            </View>
            {view.trackingId && (
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Tracking</Text>
                <Text style={[styles.detailValue, styles.mono]}>{view.trackingId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items */}
        <View style={styles.table}>
          <View style={styles.th} fixed>
            <Text style={styles.cNo}>#</Text>
            <Text style={styles.cItem}>Item</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cUnit}>Unit price</Text>
            <Text style={styles.cTotal}>Total</Text>
          </View>
          {view.items.map((item, index) => (
            <View key={item.key} style={[styles.tr, index % 2 !== 0 ? styles.odd : {}]} wrap={false}>
              <Text style={[styles.cNo, styles.muted]}>{index + 1}</Text>
              <View style={styles.cItem}>
                <Text>{item.name}</Text>
                {(item.size || item.sku) && (
                  <Text style={styles.itemSub}>
                    {[item.size, item.sku ? `SKU ${item.sku}` : null].filter(Boolean).join(" · ")}
                  </Text>
                )}
              </View>
              <Text style={styles.cQty}>{item.quantity}</Text>
              <Text style={styles.cUnit}>{tk(item.unitPrice)}</Text>
              <Text style={[styles.cTotal, styles.bold]}>{tk(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Notes + totals */}
        <View style={styles.summary} wrap={false}>
          <View style={styles.left}>
            {view.notes && (
              <View>
                <Text style={styles.infoTitle}>ORDER NOTE</Text>
                <Text>{view.notes}</Text>
              </View>
            )}
            <View>
              <Text style={styles.infoTitle}>TERMS & CONDITIONS</Text>
              {INVOICE_COMPANY.terms.map((line) => (
                <Text key={line} style={styles.small}>
                  {line}
                </Text>
              ))}
              <Text style={styles.small}>
                {INVOICE_COMPANY.email} · {INVOICE_COMPANY.phone}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <View style={styles.line}>
              <View>
                <Text>Subtotal</Text>
                <Text style={styles.lineSub}>
                  {view.units} unit{view.units === 1 ? "" : "s"}
                </Text>
              </View>
              <Text>{tk(view.subtotal)}</Text>
            </View>

            {coupon && (
              <View style={styles.line}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: EMERALD }}>
                    Coupon <Text style={[styles.mono, styles.bold]}>{coupon.code}</Text>
                  </Text>
                  {coupon.title && <Text style={styles.lineSub}>{coupon.title}</Text>}
                </View>
                <Text style={{ color: EMERALD }}>- {tk(coupon.amount)}</Text>
              </View>
            )}

            <View style={styles.line}>
              <View style={{ flex: 1 }}>
                <Text style={delivery.isFree ? { color: EMERALD } : {}}>Delivery ({delivery.zone})</Text>
                {delivery.isFree && (
                  <Text style={styles.lineSub}>
                    {delivery.freeMinOrderAmount !== null
                      ? `Free delivery on orders of ${tk(delivery.freeMinOrderAmount)} or more`
                      : "Free delivery offer applied"}
                  </Text>
                )}
              </View>
              <Text style={delivery.isFree ? { color: EMERALD } : {}}>
                {delivery.isFree ? "Free" : tk(delivery.charge)}
              </Text>
            </View>

            <View style={styles.grand}>
              <Text>Grand total</Text>
              <Text>{tk(view.grandTotal)}</Text>
            </View>
            {view.savings > 0 && (
              <Text style={[styles.small, { color: EMERALD, textAlign: "right" }]}>
                You saved {tk(view.savings)} on this order
              </Text>
            )}

            <View style={styles.due}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{payment.isPaid ? "Amount paid" : "Amount due"}</Text>
                <Text style={styles.lineSub}>{payment.dueLabel}</Text>
              </View>
              <Text style={styles.bold}>
                {tk(payment.isPaid ? view.grandTotal : payment.amountDue)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.thanks}>Thank you for your purchase</Text>

        {/* Footer on every page */}
        <View style={styles.footer} fixed>
          <Text>
            {INVOICE_COMPANY.name} · {INVOICE_COMPANY.address}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
