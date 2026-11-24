import { ILocalCartItem } from "@/modules/cart/utils/local-cart.utils";

// Prices saved by older add-to-cart calls are strings ("550"), so coerce first.
const num = (value: unknown) => Number(value) || 0;

export const formatTk = (value: number) =>
  `৳${num(value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

/** What one line costs: the discount price when it is lower, as checkout charges. */
export function linePricing(item: Pick<ILocalCartItem, "price" | "discountPrice" | "quantity">) {
  const price = num(item.price);
  const discount = num(item.discountPrice);
  const hasDiscount = discount > 0 && discount < price;
  const unit = hasDiscount ? discount : price;
  const quantity = num(item.quantity) || 1;
  return {
    price,
    unit,
    hasDiscount,
    quantity,
    lineTotal: unit * quantity,
    lineOriginal: price * quantity,
    lineSavings: hasDiscount ? (price - discount) * quantity : 0,
    percentOff: hasDiscount ? Math.round(((price - discount) / price) * 100) : 0,
  };
}

/** Totals for the summary: regular price, product savings and what is paid. */
export function cartTotals(items: ILocalCartItem[]) {
  return items.reduce(
    (acc, item) => {
      const line = linePricing(item);
      acc.units += line.quantity;
      acc.original += line.lineOriginal;
      acc.savings += line.lineSavings;
      acc.total += line.lineTotal;
      return acc;
    },
    { units: 0, original: 0, savings: 0, total: 0 },
  );
}
