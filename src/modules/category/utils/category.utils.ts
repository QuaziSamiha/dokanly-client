import type { CategoryFormData } from "@/modules/category/schemas/category.schema";

/**
 * Same rule as the server's slugify (natura-care-server category-field.transforms):
 * "Combos & Gift Packs" -> "combos-gift-packs". Used only to preview the URL.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Which form field a category API error belongs to, so it can be shown under
 * that field instead of only in a toast. Matches the server's messages in
 * natura-care-server/docs/category.md#error-reference.
 */
export function categoryErrorField(
  message: unknown,
): keyof CategoryFormData | null {
  if (typeof message !== "string") return null;
  if (/make this category (in)?active|archive this category/i.test(message)) {
    return "status";
  }
  if (/name|slug|url/i.test(message)) return "categoryName";
  return null;
}
