import { formatDistanceToNow } from "date-fns";
import {
  ISupportPolicyMeta,
  POLICY_MIN_WORDS,
  SUPPORT_POLICIES,
} from "@/modules/support/constants/support.constants";
import { ISupport } from "@/modules/support/types/support.types";

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

// * Plain text of the editor HTML, used for excerpts, counts and comparisons.
export function htmlToText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<\/(p|li|h[1-6])>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (entity) => HTML_ENTITIES[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getContentStats(html?: string) {
  const text = htmlToText(html);
  const words = text ? text.split(" ").length : 0;
  // * Bold-only paragraphs are what the editor produces for section headings.
  const sections = (html?.match(/<p><strong>[^<]+<\/strong><\/p>/gi) ?? []).length;
  return {
    text,
    words,
    sections,
    readMinutes: Math.max(1, Math.round(words / 200)),
  };
}

export interface IPolicySection {
  id: string;
  title: string;
}

// * Prepares editor HTML for the storefront:
// * - "&nbsp;" between every word stops lines wrapping, so it becomes a space.
// * - Empty spacer paragraphs are dropped; spacing comes from CSS instead.
// * - Bold-only paragraphs become <h2> anchors that feed the table of contents.
export function preparePolicyHtml(html?: string): {
  html: string;
  sections: IPolicySection[];
} {
  if (!html) return { html: "", sections: [] };

  const sections: IPolicySection[] = [];
  const usedIds = new Set<string>();

  const prepared = html
    .replace(/&nbsp;/g, " ")
    .replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<p><strong>([^<]+)<\/strong><\/p>/gi, (_match, rawTitle: string) => {
      const title = htmlToText(rawTitle);
      const baseId =
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
        "section";
      let id = baseId;
      for (let n = 2; usedIds.has(id); n++) id = `${baseId}-${n}`;
      usedIds.add(id);
      sections.push({ id, title });
      return `<h2 id="${id}">${rawTitle}</h2>`;
    });

  return { html: prepared, sections };
}

export function formatLongDate(date?: string): string {
  if (!date) return "-";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimeAgo(date?: string): string {
  if (!date) return "-";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "-";
  return formatDistanceToNow(parsed, { addSuffix: true });
}

export type PolicyHealth =
  | { level: "missing"; message: string }
  | { level: "warning"; message: string }
  | { level: "ok"; message: string };

// * Flags the problems a store admin should fix before customers notice them.
export function getPolicyHealth(
  meta: ISupportPolicyMeta,
  record: ISupport | undefined,
  allRecords: ISupport[],
): PolicyHealth {
  if (!record) {
    return {
      level: "missing",
      message: "Not set up yet. Customers see an empty page.",
    };
  }
  const { text, words } = getContentStats(record.description);
  if (words < POLICY_MIN_WORDS) {
    return {
      level: "warning",
      message: `Looks like placeholder text (${words} words). Add the full policy.`,
    };
  }

  const duplicate = allRecords.find(
    (other) =>
      other.type !== record.type &&
      htmlToText(other.description).toLowerCase() === text.toLowerCase(),
  );
  if (duplicate) {
    const duplicateTitle =
      SUPPORT_POLICIES.find((p) => p.type === duplicate.type)?.title ??
      duplicate.type;
    return {
      level: "warning",
      message: `Same content as ${duplicateTitle}. Each page should cover its own topic.`,
    };
  }

  return { level: "ok", message: "Live on the storefront." };
}
