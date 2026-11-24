import { z } from "zod";

const existingImageSchema = z.object({
  filePath: z.string(),
  name: z.string(),
  attachId: z.number(),
});

// Length of what the reader sees in an editor's HTML: tags removed, &nbsp; as a space.
const htmlTextLength = (html?: string | null) =>
  (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;

// One size of a VARIABLE product (one row of the Variation card).
// Number inputs emit null when cleared, so the numbers are nullish here and
// "required" is checked in productSchema's superRefine. A type error would
// stop zod before the refinement, hiding the other messages.
export const variantSchema = z.object({
  // Set when editing: the server updates sizes with an id, adds the others
  // and removes the ones left out. Never strip it on submit.
  id: z.number().int().positive().optional(),
  size: z
    .string()
    .trim()
    .max(50, "Size must be at most 50 characters")
    .optional(),
  price: z
    .number({ message: "Base price must be a number" })
    .positive("Base price must be greater than zero")
    .nullish(),
  // Same as a simple product's: empty or 0 = no discount; must be below price.
  discountPrice: z
    .number({ message: "Discount price must be a number" })
    .min(0, "Discount price cannot be negative")
    .nullish(),
  quantity: z
    .number({ message: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .nullish(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// One line of a COMBO: a product, its size when it has sizes, and units.
// Select fields hold ids as strings.
export const bundleItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().nullish(),
  quantity: z
    .number({ message: "Qty must be a number" })
    .int("Qty must be a whole number")
    .min(1, "Qty must be at least 1")
    .nullish(),
});

export const productSchema = z
  .object({
    productName: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .min(3, "Product name must be at least 3 characters long")
      .max(100, "Product name must be less than 100 characters"),
    // Rich text: limits apply to the visible text, not the HTML markup.
    shortDescription: z
      .string()
      .nullable()
      .optional()
      .refine((value) => {
        const length = htmlTextLength(value);
        return length === 0 || length >= 10;
      }, "Short description must be at least 10 characters long")
      .refine(
        (value) => htmlTextLength(value) <= 500,
        "Short description must be less than 500 characters",
      ),
    description: z.string().trim().optional().or(z.literal("")).nullable(),
    productImages: z
      .array(
        z.union([
          z.instanceof(File), // new uploaded image
          existingImageSchema, // your existing backend image shape
        ])
      )
      .nonempty("At least one image is required"),
    // Simple products (and the combo's price): required per type below.
    size: z
      .number({ message: "Size is required" })
      .positive("Size must be greater than zero")
      .nullish(),
    price: z
      .number({ message: "Selling price is required" })
      .positive("Selling price must be greater than zero")
      .nullish(),
    discountPrice: z
      .number()
      .positive("Discount price must be greater than zero")
      .nullable()
      .optional(),
    quantity: z
      .number({ message: "Product quantity is required" })
      .min(0, "Product quantity must be valid")
      .nullish(),
    productCategory: z.string().trim().min(1, "Product category is required"),
    // ARCHIVED isn't settable: deleting a product archives it.
    productStatus: z.enum(["DRAFT", "ACTIVE", "INACTIVE"], {
      message: "Product status is required",
    }),
    productType: z.enum(["SIMPLE", "VARIABLE", "COMBO"], {
      message: "Product type is required",
    }),
    featured: z.boolean(),
    variants: z.array(variantSchema),
    bundleItems: z.array(bundleItemSchema),
  })
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });

    // ===== Price: a simple product or a combo has one; sizes have their own =====
    if (data.productType !== "VARIABLE") {
      if (data.price == null) issue(["price"], "Selling price is required");
      if (
        data.price != null &&
        data.discountPrice &&
        data.discountPrice > 0 &&
        data.discountPrice >= data.price
      ) {
        issue(["discountPrice"], "Discount price must be less than selling price");
      }
    }

    // ===== Simple: stock and pack size, as before =====
    if (data.productType === "SIMPLE") {
      if (data.quantity == null) issue(["quantity"], "Product quantity is required");
      if (data.size == null) issue(["size"], "Size is required");
    }

    // ===== Variable: at least one size; labels filled and different =====
    if (data.productType === "VARIABLE") {
      if (data.variants.length === 0) {
        issue(["variants"], "Add at least one size");
      }
      const seen = new Map<string, number>();
      data.variants.forEach((variant, index) => {
        const size = variant.size?.trim() ?? "";
        if (!size) {
          issue(["variants", index, "size"], "Size is required");
        } else {
          const key = size.toLowerCase();
          if (seen.has(key)) {
            issue(["variants", index, "size"], "This size is already listed");
          }
          seen.set(key, index);
        }
        if (variant.price == null) {
          issue(["variants", index, "price"], "Base price is required");
        } else if (
          variant.discountPrice &&
          variant.discountPrice > 0 &&
          variant.discountPrice >= variant.price
        ) {
          issue(
            ["variants", index, "discountPrice"],
            "Must be less than base price",
          );
        }
        if (variant.quantity == null) {
          issue(["variants", index, "quantity"], "Stock is required");
        }
      });
    }

    // ===== Combo: at least one item; each complete and listed once =====
    if (data.productType === "COMBO") {
      if (data.bundleItems.length === 0) {
        issue(["bundleItems"], "Add at least one product to the combo");
      }
      const seen = new Set<string>();
      data.bundleItems.forEach((item, index) => {
        if (!item.productId) {
          issue(["bundleItems", index, "productId"], "Choose a product");
          return;
        }
        const key = `${item.productId}:${item.variantId ?? ""}`;
        if (seen.has(key)) {
          issue(["bundleItems", index, "productId"], "Already in the combo");
        }
        seen.add(key);
        if (item.quantity == null) {
          issue(["bundleItems", index, "quantity"], "Qty is required");
        }
      });
    }
  });

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
export type BundleItemFormData = z.infer<typeof bundleItemSchema>;

// Empty rows the cards append; null (not 0) so inputs start with their placeholder.
export const emptyVariant = (): VariantFormData => ({
  size: "",
  price: null,
  discountPrice: null,
  quantity: null,
  status: "ACTIVE",
});

export const emptyBundleItem = (): BundleItemFormData => ({
  productId: undefined,
  variantId: null,
  quantity: 1,
});

// Request bodies: the server reads these as JSON text inside the multipart form.
// With `initial` (the sizes the edit form loaded), an existing size's stock is
// left out unless it was changed: the server books stock through the inventory
// ledger and leaves an omitted quantity as it is.
export const toVariantsPayload = (
  variants: VariantFormData[],
  initial?: VariantFormData[],
) =>
  JSON.stringify(
    variants.map((v) => {
      const loaded = v.id ? initial?.find((i) => i.id === v.id) : undefined;
      const stockUnchanged =
        !!loaded && (loaded.quantity ?? 0) === (v.quantity ?? 0);
      return {
        ...(v.id ? { id: v.id } : {}),
        size: (v.size ?? "").trim(),
        price: v.price,
        discountPrice: v.discountPrice ?? 0,
        ...(stockUnchanged ? {} : { quantity: v.quantity ?? 0 }),
        status: v.status,
      };
    }),
  );

export const toBundleItemsPayload = (items: BundleItemFormData[]) =>
  JSON.stringify(
    items.map((item) => ({
      productId: Number(item.productId),
      ...(item.variantId ? { variantId: Number(item.variantId) } : {}),
      quantity: item.quantity ?? 1,
    })),
  );

// What customers pay for a size: the discount price when it is set and below
// the base price, else the base price (same rule as a simple product).
export const variantSalePrice = (
  price?: number | null,
  discountPrice?: number | null,
) => {
  const base = Number(price) || 0;
  const discount = Number(discountPrice) || 0;
  return discount > 0 && discount < base ? discount : base;
};
