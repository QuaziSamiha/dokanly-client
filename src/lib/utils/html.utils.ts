/**
 * Turns rich-text (Quill) HTML into plain text for excerpts, table previews
 * and meta tags.
 *
 * Content comes from Quill, which encodes spaces and punctuation as HTML
 * entities — stripping tags alone leaves those as literal text (an excerpt
 * reading "Shikakai&nbsp;purifies"), so the common ones are decoded too.
 */
export const stripHtml = (html?: string): string => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};
