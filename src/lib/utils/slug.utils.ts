// Mirrors the server's slugify(): fold accents, lowercase, runs of anything that
// isn't a-z/0-9 become one hyphen, trim hyphens. "Combos & Gift Packs" → "combos-gift-packs".
export function categorySlug(categoryName: string) {
  return categoryName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSlug(categoryName: string) {
  const slug = categoryName
    .toLowerCase()
    .trim() // remove leading and trailing spaces
    .replace(/\s+/g, "-"); // replace spaces with hyphen
  // .replace(/[^a-z0-9-]/g, '');  // remove special characters
  return slug;
}
