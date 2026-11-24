import { getBaseUrl } from "@/config/env.config";
import { IBlogListItem, IBlogSeo } from "../types/blog.types";

/** How long a server-rendered post head / sitemap is reused before refetching. */
const BLOG_SEO_REVALIDATE_SECONDS = 300;

/**
 * SEO metadata of a published post, for `generateMetadata` and JSON-LD.
 *
 * Uses GET /blog/seo/:slug rather than the detail route, because the detail
 * route counts a page view and this runs on every server render and crawl.
 * Returns null when the post is not published or the API is unreachable, so a
 * failed fetch degrades to generic metadata instead of breaking the page.
 */
export async function fetchBlogSeo(slug: string): Promise<IBlogSeo | null> {
  try {
    const res = await fetch(
      `${getBaseUrl()}/blog/seo/${encodeURIComponent(slug)}`,
      { next: { revalidate: BLOG_SEO_REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data as IBlogSeo) ?? null;
  } catch {
    return null;
  }
}

/**
 * Every published post, for the sitemap. Without `page`/`limit` the API
 * returns the full list (listing payloads never include the body). An
 * unreachable API yields an empty list so the static sitemap entries still
 * render.
 */
export async function fetchPublishedBlogsForSitemap(): Promise<
  IBlogListItem[]
> {
  try {
    const res = await fetch(`${getBaseUrl()}/blog/published`, {
      next: { revalidate: BLOG_SEO_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.data) ? (body.data as IBlogListItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * JSON for a <script type="application/ld+json"> block. `<` is escaped so text
 * written by an admin (titles, descriptions) can never close the script tag.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
