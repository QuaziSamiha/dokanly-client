import { CreateBlogType, UpdateBlogType } from "../schemas/blog.schema";

/**
 * Turns a comma-separated input into the JSON array the API's array transform
 * expects. Empty input yields `[]` rather than being dropped, so clearing the
 * tags on an edit actually clears them server-side.
 */
const toJsonArray = (value?: string): string =>
  JSON.stringify(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

/**
 * Builds the multipart payload for creating a blog.
 *
 * Optional text fields are only appended when they carry a value: the API's
 * validators run on whatever arrives, and sending "" would fail the URL check
 * on `videoUrl` rather than being read as "not provided".
 */
export function buildBlogFormData(data: CreateBlogType): FormData {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("typeId", String(data.blogType));
  formData.append("status", data.status);
  formData.append("featured", String(Boolean(data.featured)));
  formData.append("allowComments", String(data.allowComments !== false));
  formData.append("tags", toJsonArray(data.tags));
  formData.append("metaKeywords", toJsonArray(data.metaKeywords));

  if (data.slug) formData.append("slug", data.slug);
  if (data.excerpt) formData.append("excerpt", data.excerpt);
  if (data.bannerAlt) formData.append("bannerAlt", data.bannerAlt);
  if (data.authorName) formData.append("authorName", data.authorName);
  if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
  if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
  if (data.metaDescription) {
    formData.append("metaDescription", data.metaDescription);
  }

  // `null` (a cleared field) is omitted rather than sent, which the API reads
  // as "not provided".
  if (typeof data.readTime === "number") {
    formData.append("readTime", String(data.readTime));
  }

  if (data.banner instanceof File) {
    formData.append("bannerFile", data.banner);
  }

  return formData;
}

/**
 * Builds the multipart payload for an edit.
 *
 * Only dirty fields are sent, so an untouched field keeps whatever the API
 * already holds. Clearing the cover image or video is an explicit instruction
 * (`removeBanner` / `removeVideo`) rather than an empty value, because the API
 * treats a missing key as "leave it alone".
 */
export function buildBlogUpdateFormData(
  data: UpdateBlogType,
  dirtyFields: Partial<Record<keyof UpdateBlogType, unknown>>,
  options: { removeBanner?: boolean; removeVideo?: boolean } = {},
): FormData {
  const formData = new FormData();

  if (dirtyFields.title && data.title) formData.append("title", data.title);
  // An emptied slug is not sent: the post keeps its current URL.
  if (dirtyFields.slug && data.slug) formData.append("slug", data.slug);
  if (dirtyFields.content && data.content) {
    formData.append("content", data.content);
  }
  if (dirtyFields.blogType && data.blogType) {
    formData.append("typeId", String(data.blogType));
  }
  if (dirtyFields.status && data.status) {
    formData.append("status", data.status);
  }
  if (dirtyFields.excerpt) formData.append("excerpt", data.excerpt ?? "");
  if (dirtyFields.bannerAlt) {
    formData.append("bannerAlt", data.bannerAlt ?? "");
  }
  if (dirtyFields.authorName) {
    formData.append("authorName", data.authorName ?? "");
  }
  if (dirtyFields.featured) {
    formData.append("featured", String(Boolean(data.featured)));
  }
  if (dirtyFields.allowComments) {
    formData.append("allowComments", String(Boolean(data.allowComments)));
  }
  if (dirtyFields.tags) formData.append("tags", toJsonArray(data.tags));
  if (dirtyFields.metaKeywords) {
    formData.append("metaKeywords", toJsonArray(data.metaKeywords));
  }
  if (dirtyFields.metaTitle) {
    formData.append("metaTitle", data.metaTitle ?? "");
  }
  if (dirtyFields.metaDescription) {
    formData.append("metaDescription", data.metaDescription ?? "");
  }

  if (dirtyFields.readTime && typeof data.readTime === "number") {
    formData.append("readTime", String(data.readTime));
  }

  if (data.banner instanceof File) {
    formData.append("bannerFile", data.banner);
  } else if (options.removeBanner) {
    formData.append("removeBanner", "true");
  }

  if (options.removeVideo) {
    formData.append("removeVideo", "true");
  } else if (dirtyFields.videoUrl && data.videoUrl) {
    formData.append("videoUrl", data.videoUrl);
  }

  return formData;
}
