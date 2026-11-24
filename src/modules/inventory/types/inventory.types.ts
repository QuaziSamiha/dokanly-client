/**
 * Shapes returned by the server's /inventory endpoints (admin views). They
 * mirror src/modules/inventory/dto/admin-inventory-response.dto.ts on the
 * server; money is in BDT and already a number.
 */

export type RecordStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type WarehouseType = "WAREHOUSE" | "HUB" | "VIRTUAL";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type StockLevelState = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export type StockMovementType =
  | "OPENING_BALANCE"
  | "PURCHASE_RECEIPT"
  | "SALE"
  | "CUSTOMER_RETURN"
  | "SUPPLIER_RETURN"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "ADJUSTMENT"
  | "COUNT_CORRECTION"
  | "DAMAGE"
  | "EXPIRY"
  | "REVERSAL";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export type StockTransferStatus = "DRAFT" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
export type StockAdjustmentType = "MANUAL" | "PRODUCT_FORM" | "STOCK_COUNT" | "WRITE_OFF";
export type StockDocumentStatus = "DRAFT" | "POSTED" | "CANCELLED";

export type AdjustmentReason =
  | "DATA_ENTRY_ERROR"
  | "FOUND"
  | "LOST_OR_STOLEN"
  | "DAMAGED"
  | "EXPIRED"
  | "SAMPLE_OR_GIFT"
  | "INTERNAL_USE"
  | "COUNT_DIFFERENCE"
  | "OTHER";

// ============ SHARED REFERENCES ============

export interface IInventoryUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface IWarehouseRef {
  id: number;
  code: string;
  name: string;
  type: WarehouseType;
  isSellable: boolean;
  status: RecordStatus;
}

/** A stock item: the product, plus its size when the row is for one size of a VARIABLE product. */
export interface IProductRef {
  id: number;
  name: string;
  slug: string;
  /** The size's own SKU when it has one, else the product's. */
  sku: string | null;
  status: ProductStatus;
  variantId: number | null;
  size: string | null;
  sizeStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED" | null; // ARCHIVED = removed from the product (history only)
}

export interface ISupplierRef {
  id: number;
  code: string;
  name: string;
}

export interface ILotRef {
  id: number;
  lotNumber: string;
  expiresAt: string | null;
}

// ============ MASTER DATA ============

export interface IWarehouse {
  id: number;
  sid: string;
  code: string;
  name: string;
  type: WarehouseType;
  isSellable: boolean;
  isDefault: boolean;
  status: RecordStatus;
  street: string | null;
  city: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser?: IInventoryUser;
  updatedByUser?: IInventoryUser;
}

export interface ISupplier {
  id: number;
  sid: string;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  leadTimeDays: number | null;
  notes: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  createdByUser?: IInventoryUser;
}

// ============ STOCK ============

export interface IStockLevel {
  id: number;
  product: IProductRef;
  warehouse: IWarehouseRef;
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  state: StockLevelState;
  reorderPoint: number | null;
  reorderQty: number | null;
  safetyStock: number | null;
  avgUnitCost: number;
  stockValue: number;
  lastMovementAt: string | null;
  lastCountedAt: string | null;
  version: number;
  updatedAt: string;
}

export interface IStockLot {
  id: number;
  sid: string;
  product: IProductRef;
  lotNumber: string;
  manufacturedAt: string | null;
  expiresAt: string | null;
  daysToExpiry: number | null;
  unitCost: number | null;
  supplier?: ISupplierRef;
  receivedAt: string;
  totalOnHand: number;
  warehouses: { warehouse: IWarehouseRef; onHand: number }[];
}

export interface IMovementSource {
  kind: "ORDER" | "PURCHASE_ORDER" | "TRANSFER" | "ADJUSTMENT" | "REVERSAL" | "NONE";
  id: number | null;
  number: string | null;
  lineId: number | null;
}

export interface IStockMovement {
  id: number;
  sid: string;
  type: StockMovementType;
  product: IProductRef;
  warehouse: IWarehouseRef;
  lot: ILotRef | null;
  quantity: number;
  onHandAfter: number;
  unitCost: number | null;
  value: number | null;
  source: IMovementSource;
  reversedById: number | null;
  idempotencyKey: string;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  createdByUser?: IInventoryUser;
}

// ============ DOCUMENTS ============

export interface IStockAdjustmentItem {
  id: number;
  product: IProductRef;
  lot: ILotRef | null;
  expectedQty: number;
  countedQty: number;
  difference: number;
  reason: AdjustmentReason | null;
}

export interface IStockAdjustment {
  id: number;
  sid: string;
  adjustmentNumber: string;
  type: StockAdjustmentType;
  status: StockDocumentStatus;
  warehouse: IWarehouseRef;
  reason: AdjustmentReason | null;
  notes: string | null;
  netChange: number;
  items: IStockAdjustmentItem[];
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser?: IInventoryUser;
  postedByUser?: IInventoryUser;
}

export interface IPurchaseOrderItem {
  id: number;
  product: IProductRef;
  quantityOrdered: number;
  quantityReceived: number;
  quantityOutstanding: number;
  unitCost: number;
  lineTotal: number;
}

export interface IPurchaseOrder {
  id: number;
  sid: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  supplier: ISupplierRef;
  warehouse: IWarehouseRef;
  supplierInvoiceNo: string | null;
  orderedAt: string | null;
  expectedAt: string | null;
  receivedAt: string | null;
  subtotal: number;
  shippingCost: number;
  otherCost: number;
  total: number;
  notes: string | null;
  items: IPurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
  createdByUser?: IInventoryUser;
  updatedByUser?: IInventoryUser;
}

export interface IStockTransferItem {
  id: number;
  product: IProductRef;
  lot: ILotRef | null;
  quantitySent: number;
  quantityReceived: number | null;
  shortfall: number | null;
}

export interface IStockTransfer {
  id: number;
  sid: string;
  transferNumber: string;
  status: StockTransferStatus;
  fromWarehouse: IWarehouseRef;
  toWarehouse: IWarehouseRef;
  shippedAt: string | null;
  receivedAt: string | null;
  notes: string | null;
  items: IStockTransferItem[];
  createdAt: string;
  updatedAt: string;
  createdByUser?: IInventoryUser;
}

// ============ REPORTS ============

export interface IValuationReport {
  warehouses: {
    warehouseId: number;
    warehouseCode: string;
    warehouseName: string;
    products: number;
    units: number;
    value: number;
  }[];
  totalUnits: number;
  totalValue: number;
}

export interface IReorderSuggestion {
  productId: number;
  productName: string;
  variantId: number | null;
  size: string | null;
  sku: string | null;
  warehouseId: number;
  warehouseCode: string;
  available: number;
  incoming: number;
  reorderPoint: number;
  suggestedQty: number;
}

export interface IExpiringLot {
  lot: ILotRef;
  product: IProductRef;
  warehouse: IWarehouseRef;
  onHand: number;
  daysToExpiry: number;
  value: number | null;
}

export interface IReconciliationReport {
  healthy: boolean;
  shopDrift: {
    productId: number;
    productName: string;
    variantId: number | null;
    size: string | null;
    shopQuantity: number;
    warehouseAvailable: number;
    difference: number;
  }[];
  ledgerDrift: {
    productId: number;
    variantId: number | null;
    warehouseId: number;
    onHand: number;
    ledgerTotal: number;
  }[];
  checkedAt: string;
}
