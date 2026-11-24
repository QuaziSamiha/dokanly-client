import { z } from "zod";
import { INVENTORY_LIMITS as L } from "@/modules/inventory/constants/inventory.constants";

/**
 * Form schemas. Limits and rules mirror the server's request DTOs, so a value
 * the form accepts isn't rejected by the API for its shape. Selects
 * (SingleSelectSearch) hold ids as strings, hence the coercion.
 */

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

/** A picked id; the select stores it as a string. */
const requiredId = (label: string) =>
  z.string({ error: `${label} is required` }).min(1, `${label} is required`);

/** An optional picked id ("" = none). */
const optionalId = z.string().optional().nullable();

/** A picked stock item: "12" for a product, "12:41" for one size of it (stockItemKey). */
const stockItem = () => requiredId("Product");

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional().nullable();

const quantity = (label: string, min = 1) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .min(min, min === 0 ? `${label} cannot be negative` : `${label} must be at least ${min}`)
    .max(L.QUANTITY_MAX, `${label} must be at most ${L.QUANTITY_MAX.toLocaleString()}`);

const money = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(0, `${label} cannot be negative`)
    .max(L.MONEY_MAX, `${label} is too large`);

const code = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(L.CODE_MAX, `${label} must be at most ${L.CODE_MAX} characters`)
    .regex(CODE_PATTERN, "Use letters, digits and hyphens only, starting with a letter or digit");

// ============ WAREHOUSE ============

export const warehouseSchema = z.object({
  code: code("Warehouse code"),
  name: z
    .string({ error: "Warehouse name is required" })
    .trim()
    .min(1, "Warehouse name is required")
    .max(L.NAME_MAX, `Warehouse name must be at most ${L.NAME_MAX} characters`),
  type: z.enum(["WAREHOUSE", "HUB", "VIRTUAL"], { error: "Choose a type" }),
  status: z.enum(["ACTIVE", "INACTIVE"], { error: "Choose a status" }),
  isSellable: z.boolean(),
  isDefault: z.boolean(),
  street: optionalText("Street", L.STREET_MAX),
  city: optionalText("City", L.CITY_MAX),
  phone: optionalText("Phone", L.PHONE_MAX),
});
export type WarehouseFormType = z.infer<typeof warehouseSchema>;

// ============ SUPPLIER ============

export const supplierSchema = z.object({
  code: code("Supplier code"),
  name: z
    .string({ error: "Supplier name is required" })
    .trim()
    .min(1, "Supplier name is required")
    .max(L.NAME_MAX, `Supplier name must be at most ${L.NAME_MAX} characters`),
  status: z.enum(["ACTIVE", "INACTIVE"], { error: "Choose a status" }),
  contactName: optionalText("Contact name", L.CONTACT_NAME_MAX),
  phone: optionalText("Phone", L.PHONE_MAX),
  email: z
    .string()
    .trim()
    .max(L.EMAIL_MAX)
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address")
    .optional()
    .nullable(),
  address: optionalText("Address", L.NOTES_MAX),
  leadTimeDays: z
    .number({ error: "Lead time must be a number" })
    .int("Lead time must be whole days")
    .min(0, "Lead time cannot be negative")
    .max(L.LEAD_TIME_MAX, `Lead time must be at most ${L.LEAD_TIME_MAX} days`)
    .optional()
    .nullable(),
  notes: optionalText("Notes", L.NOTES_MAX),
});
export type SupplierFormType = z.infer<typeof supplierSchema>;

// ============ STOCK SETTINGS ============

const optionalCount = (label: string, min = 0) =>
  z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, min === 0 ? `${label} cannot be negative` : `${label} must be at least ${min}`)
    .max(L.QUANTITY_MAX)
    .optional()
    .nullable();

export const stockSettingsSchema = z.object({
  reorderPoint: optionalCount("Reorder point"),
  reorderQty: optionalCount("Reorder quantity", 1),
  safetyStock: optionalCount("Safety stock"),
});
export type StockSettingsFormType = z.infer<typeof stockSettingsSchema>;

// ============ PURCHASE ORDER ============

export const purchaseOrderSchema = z.object({
  supplierId: requiredId("Supplier"),
  warehouseId: requiredId("Delivery warehouse"),
  expectedAt: z.string().optional().nullable(),
  supplierInvoiceNo: optionalText("Invoice number", L.INVOICE_NO_MAX),
  shippingCost: money("Shipping cost").optional().nullable(),
  otherCost: money("Other charges").optional().nullable(),
  notes: optionalText("Notes", L.NOTES_MAX),
  items: z
    .array(
      z.object({
        productId: stockItem(),
        quantityOrdered: quantity("Quantity"),
        unitCost: money("Unit cost"),
      }),
    )
    .min(1, "Add at least one product")
    .max(L.LINES_MAX)
    .refine(
      (items) => new Set(items.map((i) => i.productId)).size === items.length,
      "Each product (or size) can be on the order only once",
    ),
});
export type PurchaseOrderFormType = z.infer<typeof purchaseOrderSchema>;

export const receivePurchaseOrderSchema = z.object({
  supplierInvoiceNo: optionalText("Invoice number", L.INVOICE_NO_MAX),
  note: optionalText("Note", L.NOTE_MAX),
  items: z.array(
    z
      .object({
        purchaseOrderItemId: z.number(),
        outstanding: z.number(),
        quantity: z
          .number({ error: "Enter a number" })
          .int("Must be a whole number")
          .min(0, "Cannot be negative")
          .optional()
          .nullable(),
        lotNumber: optionalText("Batch number", L.LOT_NUMBER_MAX),
        manufacturedAt: z.string().optional().nullable(),
        expiresAt: z.string().optional().nullable(),
      })
      .refine((l) => (l.quantity ?? 0) <= l.outstanding, {
        message: "More than is outstanding",
        path: ["quantity"],
      })
      .refine(
        (l) => !l.manufacturedAt || !l.expiresAt || l.expiresAt > l.manufacturedAt,
        { message: "Expiry must be after manufacture", path: ["expiresAt"] },
      ),
  ),
});
export type ReceivePurchaseOrderFormType = z.infer<typeof receivePurchaseOrderSchema>;

// ============ TRANSFER ============

export const transferSchema = z
  .object({
    fromWarehouseId: requiredId("Source warehouse"),
    toWarehouseId: requiredId("Destination warehouse"),
    notes: optionalText("Notes", L.NOTES_MAX),
    items: z
      .array(
        z.object({
          productId: stockItem(),
          lotId: optionalId,
          quantity: quantity("Quantity"),
        }),
      )
      .min(1, "Add at least one product")
      .max(L.LINES_MAX),
  })
  .refine((v) => v.fromWarehouseId !== v.toWarehouseId, {
    message: "Source and destination must be different",
    path: ["toWarehouseId"],
  });
export type TransferFormType = z.infer<typeof transferSchema>;

// ============ ADJUSTMENT ============

export const adjustmentSchema = z
  .object({
    type: z.enum(["STOCK_COUNT", "MANUAL", "WRITE_OFF"], { error: "Choose a type" }),
    warehouseId: requiredId("Warehouse"),
    reason: z.string().optional().nullable(),
    notes: optionalText("Notes", L.NOTES_MAX),
    post: z.boolean(),
    items: z
      .array(
        z.object({
          productId: stockItem(),
          lotId: optionalId,
          amount: quantity("Quantity", 0),
        }),
      )
      .min(1, "Add at least one product")
      .max(L.LINES_MAX),
  })
  .refine((v) => v.type !== "WRITE_OFF" || !!v.reason, {
    message: "A write-off needs a reason",
    path: ["reason"],
  })
  .refine((v) => v.type !== "WRITE_OFF" || v.items.every((i) => i.amount >= 1), {
    message: "Write off at least 1 unit per line",
    path: ["items"],
  })
  .refine(
    (v) =>
      new Set(v.items.map((i) => `${i.productId}:${i.lotId || ""}`)).size ===
      v.items.length,
    {
      message: "Each product or size (and batch) can appear only once",
      path: ["items"],
    },
  );
export type AdjustmentFormType = z.infer<typeof adjustmentSchema>;
