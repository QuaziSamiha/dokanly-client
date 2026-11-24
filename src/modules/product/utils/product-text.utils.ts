/**
 * Some short descriptions were saved from the rich-text editor, so they hold
 * markup such as "<p>Give&nbsp;your&nbsp;skin...</p>". Show them as plain text.
 */
export function toPlainText(value?: string | null): string {
  if (!value) return "";
  if (typeof window !== "undefined" && "DOMParser" in window) {
    const text =
      new DOMParser().parseFromString(value, "text/html").body.textContent ?? "";
    return text.replace(/\s+/g, " ").trim();
  }
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
