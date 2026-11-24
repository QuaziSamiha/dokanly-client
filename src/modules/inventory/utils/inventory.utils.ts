/** "Tk 1,250.50"; "—" when there is no value. */
export const formatTk = (value?: number | null) =>
  value == null
    ? "—"
    : `Tk ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** "1,250" */
export const formatQty = (value?: number | null) =>
  value == null ? "—" : Number(value).toLocaleString("en-US");

/** "+250" / "-30" for ledger quantities. */
export const formatSigned = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toLocaleString("en-US")}`;

/** "14 Oct 2026" */
export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/** "14 Oct 2026, 3:05 pm" */
export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

/** "in 21 days", "expired 5 days ago", "today". */
export const expiryHint = (days: number | null) => {
  if (days == null) return "No expiry date";
  if (days === 0) return "Expires today";
  if (days < 0) return `Expired ${Math.abs(days)} day${days === -1 ? "" : "s"} ago`;
  return `Expires in ${days} day${days === 1 ? "" : "s"}`;
};

/** Text colour for a days-to-expiry value. */
export const expiryTone = (days: number | null) => {
  if (days == null) return "text-neutralPrimary-400";
  if (days < 0) return "text-destructive-600";
  if (days <= 90) return "text-warningPrimary-700";
  return "text-neutralPrimary-500";
};

/** DateInputField stores an ISO string at UTC midnight; the API wants "2026-10-25". */
export const toDateOnly = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : undefined;

/** "2026-10-25" from the API -> the ISO string DateInputField expects. */
export const toPickerDate = (value?: string | null) =>
  value ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`).toISOString() : undefined;

// ============ STOCK ITEMS (a product, or one size of a VARIABLE product) ============

/** Picker value of a stock item: "12" for a product, "12:41" for its size 41. */
export const stockItemKey = (productId: number, variantId?: number | null) =>
  variantId ? `${productId}:${variantId}` : String(productId);

/** "12:41" -> { productId: 12, variantId: 41 }; variantId is left out for a product. */
export const splitStockItemKey = (key: string) => {
  const [productId, variantId] = key.split(":").map(Number);
  return variantId ? { productId, variantId } : { productId };
};

/** "Onion Hair Oil - 100ml" for a size, the product name otherwise. */
export const stockItemName = (product: {
  name: string;
  size?: string | null;
}) => (product.size ? `${product.name} - ${product.size}` : product.name);

/** Drops undefined, null and "" so the server applies its defaults and filters stay clean. */
export const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Partial<T>;
