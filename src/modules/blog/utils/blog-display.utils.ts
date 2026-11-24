import { stripHtml } from "@/lib/utils/html.utils";
import {
  BlogStatus,
  BlogTypeStatus,
  CommentStatus,
} from "../types/blog.types";

/** Pill + dot colours per status, shared by the table and the view modal. */
export const BLOG_STATUS_STYLES: Record<
  BlogStatus,
  { pill: string; dot: string; label: string; hint: string }
> = {
  PUBLISHED: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    label: "Published",
    hint: "Live on the blog",
  },
  DRAFT: {
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-400/30",
    dot: "bg-neutralPrimary-400",
    label: "Draft",
    hint: "Only admins can see it",
  },
  ARCHIVED: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
    label: "Archived",
    hint: "Hidden from the blog",
  },
};

/** Pill + dot colours per blog type status. */
export const BLOG_TYPE_STATUS_STYLES: Record<
  BlogTypeStatus,
  { pill: string; dot: string; label: string; hint: string }
> = {
  ACTIVE: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    label: "Active",
    hint: "Shown as a filter tab on the blog",
  },
  INACTIVE: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
    label: "Inactive",
    hint: "Hidden from the blog filters",
  },
  ARCHIVED: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
    label: "Archived",
    hint: "Retired; kept for existing posts",
  },
};

/** Pill + dot colours per comment moderation status. */
export const COMMENT_STATUS_STYLES: Record<
  CommentStatus,
  { pill: string; dot: string; label: string; hint: string }
> = {
  PENDING: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
    label: "Pending",
    hint: "Waiting for approval; not shown on the post",
  },
  APPROVED: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    label: "Approved",
    hint: "Shown on the post",
  },
  REJECTED: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
    label: "Rejected",
    hint: "Hidden from the post",
  },
  SPAM: {
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-400/30",
    dot: "bg-neutralPrimary-400",
    label: "Spam",
    hint: "Marked as spam; hidden from the post",
  },
};

/** Public URL of a post on the storefront. */
export const blogPublicPath = (slug: string) => `/blog-details/${slug}`;

/** 1284 → "1.3K"; small numbers stay exact. */
export const formatCompact = (value?: number | null) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);

export const formatBlogDate = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatBlogDateTime = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

/** "Today", "Yesterday", "5 days ago", "3 months ago", "2 years ago". */
export const timeAgo = (value?: string | Date | null) => {
  if (!value) return "";
  const days = Math.floor(
    (Date.now() - new Date(value).getTime()) / 86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

/**
 * True when a post was edited after it went live (a day's grace, so the
 * save that published it does not count as an edit).
 */
export const editedAfterPublish = (
  publishedAt?: string | null,
  updatedAt?: string | null,
) =>
  !!publishedAt &&
  !!updatedAt &&
  new Date(updatedAt).getTime() - new Date(publishedAt).getTime() >
    86_400_000;

/** Words in the post body, ignoring markup. */
export const countWords = (html?: string) => {
  const text = stripHtml(html ?? "").trim();
  return text ? text.split(/\s+/).length : 0;
};

/** Reading time at ~200 words a minute, at least one minute. */
export const estimateReadMinutes = (words: number) =>
  Math.max(1, Math.round(words / 200));
