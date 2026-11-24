import type {
  AdjustmentReason,
  PurchaseOrderStatus,
  RecordStatus,
  StockAdjustmentType,
  StockDocumentStatus,
  StockLevelState,
  StockMovementType,
  StockTransferStatus,
  WarehouseType,
} from "@/modules/inventory/types/inventory.types";

/** Server endpoints (natura-care-server src/modules/inventory/inventory.controller.ts). */
export const INVENTORY_API = {
  WAREHOUSES: "/inventory/warehouses",
  SUPPLIERS: "/inventory/suppliers",
  STOCK: "/inventory/stock",
  // * A size of a VARIABLE product is named with ?variantId=.
  stockSettings: (
    productId: number,
    warehouseId: number,
    variantId?: number | null,
  ) =>
    `/inventory/stock/${productId}/warehouses/${warehouseId}${variantId ? `?variantId=${variantId}` : ""}`,
  LOTS: "/inventory/lots",
  MOVEMENTS: "/inventory/movements",
  reverseMovement: (id: number) => `/inventory/movements/${id}/reverse`,
  ADJUSTMENTS: "/inventory/adjustments",
  PURCHASE_ORDERS: "/inventory/purchase-orders",
  TRANSFERS: "/inventory/transfers",
  VALUATION: "/inventory/reports/valuation",
  REORDER: "/inventory/reports/reorder",
  EXPIRING: "/inventory/reports/expiring",
  RECONCILIATION: "/inventory/reports/reconciliation",
  /** The admin product list, used for product pickers. */
  PRODUCTS: "/products",
} as const;

/** React Query keys; every inventory query starts with "inventory" so one invalidation refreshes them all. */
export const INVENTORY_KEY = "inventory";

/** Mirrors the server's INVENTORY_LIMITS, so the forms reject what the API would. */
export const INVENTORY_LIMITS = {
  CODE_MAX: 32,
  NAME_MAX: 255,
  STREET_MAX: 255,
  CITY_MAX: 100,
  PHONE_MAX: 20,
  CONTACT_NAME_MAX: 150,
  EMAIL_MAX: 255,
  LOT_NUMBER_MAX: 64,
  INVOICE_NO_MAX: 64,
  NOTE_MAX: 500,
  NOTES_MAX: 5000,
  LINES_MAX: 200,
  QUANTITY_MAX: 1_000_000,
  MONEY_MAX: 10_000_000,
  LEAD_TIME_MAX: 365,
} as const;

type Badge = { label: string; pill: string; dot: string };

const tone = {
  green: { pill: "bg-success-100 text-success-600 ring-success-600/20", dot: "bg-success-600" },
  red: { pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20", dot: "bg-destructive-600" },
  amber: { pill: "bg-warningPrimary-100 text-warningPrimary-700 ring-warningPrimary-600/20", dot: "bg-warningPrimary-500" },
  blue: { pill: "bg-blueSecondary-50 text-blueSecondary-600 ring-blueSecondary-600/20", dot: "bg-blueSecondary-600" },
  grey: { pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-400/30", dot: "bg-neutralPrimary-400" },
  brand: { pill: "bg-greenPrimary-950 text-greenPrimary-700 ring-greenPrimary-500/20", dot: "bg-greenPrimary-500" },
} as const;

export const RECORD_STATUS_BADGE: Record<RecordStatus, Badge> = {
  ACTIVE: { label: "Active", ...tone.green },
  INACTIVE: { label: "Inactive", ...tone.amber },
  ARCHIVED: { label: "Archived", ...tone.grey },
};

export const STOCK_STATE_BADGE: Record<StockLevelState, Badge> = {
  IN_STOCK: { label: "In stock", ...tone.green },
  LOW_STOCK: { label: "Low stock", ...tone.amber },
  OUT_OF_STOCK: { label: "Out of stock", ...tone.red },
};

export const PO_STATUS_BADGE: Record<PurchaseOrderStatus, Badge> = {
  DRAFT: { label: "Draft", ...tone.grey },
  ORDERED: { label: "Ordered", ...tone.blue },
  PARTIALLY_RECEIVED: { label: "Partly received", ...tone.amber },
  RECEIVED: { label: "Received", ...tone.green },
  CANCELLED: { label: "Cancelled", ...tone.red },
};

export const TRANSFER_STATUS_BADGE: Record<StockTransferStatus, Badge> = {
  DRAFT: { label: "Draft", ...tone.grey },
  IN_TRANSIT: { label: "In transit", ...tone.blue },
  RECEIVED: { label: "Received", ...tone.green },
  CANCELLED: { label: "Cancelled", ...tone.red },
};

export const DOCUMENT_STATUS_BADGE: Record<StockDocumentStatus, Badge> = {
  DRAFT: { label: "Draft", ...tone.grey },
  POSTED: { label: "Posted", ...tone.green },
  CANCELLED: { label: "Cancelled", ...tone.red },
};

export const MOVEMENT_TYPE_BADGE: Record<StockMovementType, Badge> = {
  OPENING_BALANCE: { label: "Opening balance", ...tone.grey },
  PURCHASE_RECEIPT: { label: "Purchase receipt", ...tone.green },
  SALE: { label: "Sale", ...tone.blue },
  CUSTOMER_RETURN: { label: "Customer return", ...tone.green },
  SUPPLIER_RETURN: { label: "Supplier return", ...tone.amber },
  TRANSFER_OUT: { label: "Transfer out", ...tone.blue },
  TRANSFER_IN: { label: "Transfer in", ...tone.brand },
  ADJUSTMENT: { label: "Adjustment", ...tone.amber },
  COUNT_CORRECTION: { label: "Count correction", ...tone.amber },
  DAMAGE: { label: "Damage", ...tone.red },
  EXPIRY: { label: "Expiry", ...tone.red },
  REVERSAL: { label: "Reversal", ...tone.grey },
};

export const ADJUSTMENT_TYPE_LABEL: Record<StockAdjustmentType, string> = {
  MANUAL: "Manual correction",
  PRODUCT_FORM: "Product form edit",
  STOCK_COUNT: "Stock count",
  WRITE_OFF: "Write-off",
};

export const ADJUSTMENT_REASON_LABEL: Record<AdjustmentReason, string> = {
  DATA_ENTRY_ERROR: "Data entry error",
  FOUND: "Found",
  LOST_OR_STOLEN: "Lost or stolen",
  DAMAGED: "Damaged",
  EXPIRED: "Expired",
  SAMPLE_OR_GIFT: "Sample or gift",
  INTERNAL_USE: "Internal use",
  COUNT_DIFFERENCE: "Count difference",
  OTHER: "Other",
};

export const WAREHOUSE_TYPE_LABEL: Record<WarehouseType, string> = {
  WAREHOUSE: "Warehouse",
  HUB: "Hub / shop",
  VIRTUAL: "Virtual",
};

/** Movement types the server lets an admin reverse. */
export const REVERSIBLE_MOVEMENT_TYPES: StockMovementType[] = [
  "OPENING_BALANCE",
  "ADJUSTMENT",
  "COUNT_CORRECTION",
  "DAMAGE",
  "EXPIRY",
];

/** Reasons a write-off accepts (the server's WRITE_OFF_REASONS). */
export const WRITE_OFF_REASONS: AdjustmentReason[] = [
  "DAMAGED",
  "EXPIRED",
  "LOST_OR_STOLEN",
  "SAMPLE_OR_GIFT",
  "INTERNAL_USE",
];

// ============ SELECT OPTIONS ({ id, name } for SingleSelectSearch) ============

const optionsOf = <K extends string>(labels: Record<K, string>, keys?: K[]) =>
  (keys ?? (Object.keys(labels) as K[])).map((id) => ({ id, name: labels[id] }));

export const warehouseTypeOptions = optionsOf(WAREHOUSE_TYPE_LABEL);
export const settableStatusOptions = [
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];
export const adjustmentTypeOptions = optionsOf(ADJUSTMENT_TYPE_LABEL, [
  "STOCK_COUNT",
  "MANUAL",
  "WRITE_OFF",
]);
export const adjustmentReasonOptions = optionsOf(ADJUSTMENT_REASON_LABEL);
export const writeOffReasonOptions = optionsOf(ADJUSTMENT_REASON_LABEL, WRITE_OFF_REASONS);

/** Filter dropdowns: "" means "all". */
export const stockStateFilterOptions = [
  { value: "", label: "All states" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "IN_STOCK", label: "In stock" },
];
export const movementTypeFilterOptions = [
  { value: "", label: "All types" },
  ...Object.entries(MOVEMENT_TYPE_BADGE).map(([value, b]) => ({ value, label: b.label })),
];
export const poStatusFilterOptions = [
  { value: "", label: "All statuses" },
  ...Object.entries(PO_STATUS_BADGE).map(([value, b]) => ({ value, label: b.label })),
];
export const transferStatusFilterOptions = [
  { value: "", label: "All statuses" },
  ...Object.entries(TRANSFER_STATUS_BADGE).map(([value, b]) => ({ value, label: b.label })),
];
export const documentStatusFilterOptions = [
  { value: "", label: "All statuses" },
  ...Object.entries(DOCUMENT_STATUS_BADGE).map(([value, b]) => ({ value, label: b.label })),
];
export const adjustmentTypeFilterOptions = [
  { value: "", label: "All types" },
  ...Object.entries(ADJUSTMENT_TYPE_LABEL).map(([value, label]) => ({ value, label })),
];
