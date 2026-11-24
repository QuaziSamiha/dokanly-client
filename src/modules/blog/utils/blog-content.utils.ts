import { stripHtml } from "@/lib/utils/html.utils";

export interface IArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Heading text → anchor id. Keeps any letter, mark (Bangla vowel signs) and number. */
const toAnchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "section";

/**
 * Gives every <h2>/<h3> in the post body an id and returns them as an outline,
 * so the page can render a table of contents with working anchor links. Ids
 * are made unique ("tips", "tips-2"), and an id the author already set is kept.
 */
export function prepareArticle(html: string): {
  html: string;
  headings: IArticleHeading[];
} {
  const headings: IArticleHeading[] = [];
  const used = new Map<string, number>();

  const withIds = (html ?? "").replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const text = stripHtml(inner);
      if (!text) return match;

      const existing = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
      let id = existing ?? toAnchor(text);
      if (!existing) {
        const seen = used.get(id) ?? 0;
        used.set(id, seen + 1);
        if (seen) id = `${id}-${seen + 1}`;
      }

      headings.push({ id, text, level: tag.toLowerCase() === "h2" ? 2 : 3 });
      return existing
        ? match
        : `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: withIds, headings };
}

export type VideoEmbed =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

/**
 * How to show the post's video link: an embedded player for YouTube and
 * Vimeo, a native player for a direct video file, and a plain link otherwise.
 */
export function getVideoEmbed(url?: string): VideoEmbed | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be" || host.endsWith("youtube.com")) {
    const id =
      host === "youtu.be"
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v") ??
          parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    if (id) {
      // The no-cookie domain sets no tracking cookies until the visitor plays.
      return {
        kind: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        title: "YouTube video",
      };
    }
  }

  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.match(/\/(\d+)/)?.[1];
    if (id) {
      return {
        kind: "iframe",
        src: `https://player.vimeo.com/video/${id}`,
        title: "Vimeo video",
      };
    }
  }

  if (/\.(mp4|webm|ogg)$/i.test(parsed.pathname)) {
    return { kind: "file", src: url };
  }

  return { kind: "link", src: url };
}
