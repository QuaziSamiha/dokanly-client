import { IProduct } from "@/modules/product/types/product.types";

/** What the product costs: the discount price wins when it is lower, as checkout charges. */
export function productPricing(product: Pick<IProduct, "price" | "discountPrice">) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPrice) || 0;
  const hasDiscount = discount > 0 && discount < price;
  return {
    price,
    unit: hasDiscount ? discount : price,
    hasDiscount,
    savings: hasDiscount ? price - discount : 0,
    percentOff: hasDiscount ? Math.round(((price - discount) / price) * 100) : 0,
  };
}

/** Stock state shown on the page; quantity is the source of truth for "out of stock". */
export function productStock(product: Pick<IProduct, "quantity" | "stockStatus">) {
  const available = Math.max(Number(product.quantity) || 0, 0);
  const isOutOfStock = available === 0 || product.stockStatus === "OUT_OF_STOCK";
  const isLowStock = !isOutOfStock && product.stockStatus === "LOW_STOCK";
  return { available, isOutOfStock, isLowStock };
}

export const productItemId = (product: Pick<IProduct, "sku" | "id">) =>
  product.sku ? product.sku : `PROD_${product.id}`;
