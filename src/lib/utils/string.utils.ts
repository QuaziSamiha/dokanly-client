/**
 * Converts ENUM-like strings (e.g., "PERCENTAGE_DISCOUNT")
 * into a user-friendly format (e.g., "Percentage Discount")
 */
export function formatEnumString(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSteadfastStatus(value?: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
