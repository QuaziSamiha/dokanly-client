"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Archive,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  ImageOff,
  Info,
  MessageSquare,
  MessageSquareOff,
  Newspaper,
  Search,
  Star,
  Tag,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import CancelButton from "@/components/primitives/button/CancelButton";
import { Skeleton } from "@/components/ui/skeleton";
import { IModal } from "@/types";
import { useBlogDetails } from "../hooks/useBlog";
import { IBlog, IBlogListItem } from "../types/blog.types";
import {
  BLOG_STATUS_STYLES,
  blogPublicPath,
  countWords,
  editedAfterPublish,
  estimateReadMinutes,
  formatBlogDate,
  formatBlogDateTime,
  formatCompact,
  timeAgo,
} from "../utils/blog-display.utils";

// Google truncates around these lengths in search results.
const SEO_TITLE_LIMIT = 60;
const SEO_DESCRIPTION_LIMIT = 160;

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

// Shared lift-on-hover for cards.
const LIFT =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function StatusPill({ status }: { status: IBlog["status"] }) {
  const style = BLOG_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "PUBLISHED" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {style.label}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`group relative min-w-0 cursor-default overflow-hidden rounded-xl p-3 sm:p-4 ${ENTER} ${LIFT} ${className}`}
      style={enterDelay(delay)}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-current opacity-[0.06] transition-transform duration-500 ease-out group-hover:scale-[2.2]" />
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:gap-2 sm:text-xs">
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-xl font-bold sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} group rounded-xl border border-neutralPrimary-100 bg-white p-3 transition-all duration-300 hover:border-greenPrimary-200 hover:shadow-md sm:p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
          <span className="text-greenPrimary-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            {icon}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** One detail: label on the left, value on the right. */
function Rule({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-neutralPrimary-500">{label}</p>
        {hint && <p className="text-xs text-neutralPrimary-400">{hint}</p>}
      </div>
      <div className="min-w-0 text-right text-sm font-semibold text-neutralPrimary-800">
        {value}
      </div>
    </div>
  );
}

function Notice({
  tone,
  icon,
  children,
}: {
  tone: "warning" | "info" | "muted";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneClass = {
    warning:
      "border-warningPrimary-200 bg-warningPrimary-100 text-warningPrimary-600",
    info: "border-blueSecondary-100 bg-blueSecondary-50 text-blueSecondary-600",
    muted:
      "border-neutralPrimary-200 bg-neutralPrimary-50 text-neutralPrimary-600",
  }[tone];
  return (
    <div
      style={enterDelay(80)}
      className={`${ENTER} flex items-start gap-3 rounded-xl border p-3 text-sm ${toneClass}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>{children}</p>
    </div>
  );
}

function AuditRow({
  label,
  date,
  name,
}: {
  label: string;
  date?: string | null;
  name?: string | null;
}) {
  return (
    <div className="group flex cursor-default items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-sm font-semibold text-blueSecondary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blueSecondary-600 group-hover:text-white group-hover:shadow-md">
        {name ? name.charAt(0).toUpperCase() : <Calendar size={16} />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        <p className="break-words text-sm text-neutralPrimary-700 sm:truncate">
          {date ? formatBlogDateTime(date) : "Not yet"}
          {name && (
            <span className="text-neutralPrimary-400"> by {name}</span>
          )}
        </p>
      </div>
    </div>
  );
}

/** The post's path, copyable as a full URL. */
function CopyUrl({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = blogPublicPath(slug);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy link"
      className="group/url inline-flex max-w-full items-center gap-1.5 rounded-md bg-neutralPrimary-50 px-2 py-1 font-mono text-xs font-medium text-neutralPrimary-600 transition-colors hover:bg-greenPrimary-950 hover:text-greenPrimary-700"
    >
      <span className="truncate">{path}</span>
      {copied ? (
        <Check size={13} className="shrink-0 text-success-600" />
      ) : (
        <Copy
          size={13}
          className="shrink-0 text-neutralPrimary-400 group-hover/url:text-greenPrimary-600"
        />
      )}
    </button>
  );
}

/** Characters used against Google's display limit. */
function LengthMeter({ length, limit }: { length: number; limit: number }) {
  const over = length > limit;
  return (
    <span
      className={`text-[11px] font-semibold tabular-nums ${
        over ? "text-warningPrimary-600" : "text-neutralPrimary-400"
      }`}
    >
      {length}/{limit}
    </span>
  );
}

/** How the post is likely to look as a Google result. */
function SearchPreview({ blog }: { blog: IBlog }) {
  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.excerpt || "";
  const clip = (text: string, limit: number) =>
    text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-neutralPrimary-100 bg-neutralPrimary-50/60 p-3">
        <p className="truncate text-xs text-neutralPrimary-500">
          naturacarebd.com › blog-details › {blog.slug}
        </p>
        <p className="mt-0.5 line-clamp-1 text-base font-medium text-blueSecondary-600">
          {clip(title, SEO_TITLE_LIMIT)}
        </p>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-neutralPrimary-600">
            {clip(description, SEO_DESCRIPTION_LIMIT)}
          </p>
        ) : (
          <p className="mt-0.5 text-sm italic text-neutralPrimary-400">
            No description. Add an excerpt so search results show a summary.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutralPrimary-500">
        <span className="inline-flex items-center gap-1.5">
          Title <LengthMeter length={title.length} limit={SEO_TITLE_LIMIT} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          Description{" "}
          <LengthMeter
            length={description.length}
            limit={SEO_DESCRIPTION_LIMIT}
          />
        </span>
        <span className="text-neutralPrimary-400">
          {blog.metaTitle || blog.metaDescription
            ? "Uses custom SEO text"
            : "Built from the title and excerpt"}
        </span>
      </div>
    </div>
  );
}

function ViewBlogSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/** Read-only overview of a post, including drafts the storefront hides. */
export default function ViewBlog({ data, onClose, setOpen }: IModal) {
  const rowData = data as IBlogListItem | undefined;
  const { blog, isBlogDetailsLoading } = useBlogDetails(rowData?.id);
  const close = () => (onClose ? onClose() : setOpen?.(false));

  if (isBlogDetailsLoading) return <ViewBlogSkeleton />;

  if (!blog) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <Newspaper size={32} />
        No blog details available.
      </div>
    );
  }

  const isLive = blog.status === "PUBLISHED";
  const words = countWords(blog.content);
  const estimated = estimateReadMinutes(words);
  const edited = editedAfterPublish(blog.publishedAt, blog.updatedAt);

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero: the cover as the storefront shows it, with the title over it */}
      <div
        className={`${ENTER} group/hero relative overflow-hidden rounded-2xl ring-1 ring-neutralPrimary-100 transition-shadow duration-500 hover:shadow-lg`}
      >
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 sm:aspect-[16/7]">
          {blog.bannerUrl ? (
            <Image
              src={blog.bannerUrl}
              alt={blog.bannerAlt || blog.title}
              fill
              sizes="(min-width: 1280px) 60vw, 90vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/hero:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-greenPrimary-400">
              <ImageOff size={32} />
              <span className="text-xs font-medium">No cover image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
            <StatusPill status={blog.status} />
            {blog.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warningPrimary-100 px-2.5 py-1 text-xs font-semibold text-warningPrimary-700">
                <Star size={12} className="fill-current" />
                Featured
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:p-5">
            {blog.type && (
              <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-blueSecondary-600">
                {blog.type.name}
              </span>
            )}
            <h2 className="line-clamp-3 text-xl font-bold leading-tight text-white drop-shadow sm:text-2xl md:text-3xl">
              {blog.title}
            </h2>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/85 sm:text-sm">
              {blog.authorName && <span>By {blog.authorName}</span>}
              {blog.authorName && <span aria-hidden>·</span>}
              <span>
                {blog.publishedAt
                  ? formatBlogDate(blog.publishedAt)
                  : `Created ${formatBlogDate(blog.createdAt)}`}
              </span>
              {blog.readTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{blog.readTime} min read</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Link + open on site */}
      <div
        style={enterDelay(60)}
        className={`${ENTER} flex flex-wrap items-center justify-between gap-2`}
      >
        <CopyUrl slug={blog.slug} />
        {isLive && (
          <a
            href={blogPublicPath(blog.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-greenPrimary-500 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-greenPrimary-600 hover:shadow-md active:translate-y-0"
          >
            <ExternalLink size={15} />
            View on website
          </a>
        )}
      </div>

      {/* Why visitors can or can't see it */}
      {blog.status === "DRAFT" && (
        <Notice tone="info" icon={<Info size={18} />}>
          <span className="font-semibold">Draft.</span> Visitors can&apos;t
          see this post yet. Set it to Published to put it live.
        </Notice>
      )}
      {blog.status === "ARCHIVED" && (
        <Notice tone="warning" icon={<Archive size={18} />}>
          <span className="font-semibold">Archived.</span> Hidden from the
          blog and its link shows &quot;not found&quot;. Publish it again to
          bring it back
          {blog.publishedAt
            ? ` with its original date (${formatBlogDate(blog.publishedAt)})`
            : ""}
          .
        </Notice>
      )}
      {isLive && !blog.allowComments && (
        <Notice tone="muted" icon={<MessageSquareOff size={18} />}>
          <span className="font-semibold">Comments are closed.</span> Existing
          approved comments still show, but the reply form is hidden.
        </Notice>
      )}
      {blog.bannerUrl && !blog.bannerAlt && (
        <Notice tone="warning" icon={<AlertTriangle size={18} />}>
          <span className="font-semibold">No alt text on the cover.</span> The
          title is used instead. A short description of the image helps screen
          readers and image search.
        </Notice>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatTile
          icon={<Eye size={14} />}
          label="Views"
          value={formatCompact(blog.viewCount)}
          hint={`${blog.viewCount.toLocaleString()} total page views`}
          className="bg-greenPrimary-950 text-greenPrimary-700"
          delay={100}
        />
        <StatTile
          icon={<MessageSquare size={14} />}
          label="Comments"
          value={blog.totalComments}
          hint={blog.allowComments ? "Approved comments" : "Comments closed"}
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={170}
        />
        <StatTile
          icon={<Clock size={14} />}
          label="Read Time"
          value={blog.readTime ? `${blog.readTime} min` : `~${estimated} min`}
          hint={
            blog.readTime
              ? `${words.toLocaleString()} words (~${estimated} min)`
              : `Estimated from ${words.toLocaleString()} words`
          }
          className="bg-purpleSecondary-100 text-purpleSecondary-500"
          delay={240}
        />
        <StatTile
          icon={<Calendar size={14} />}
          label={blog.publishedAt ? "Live Since" : "Created"}
          value={timeAgo(blog.publishedAt ?? blog.createdAt)}
          hint={
            edited
              ? `Last edited ${formatBlogDate(blog.updatedAt)}`
              : formatBlogDate(blog.publishedAt ?? blog.createdAt)
          }
          className="bg-orangeSecondary-100 text-orangeSecondary-500"
          delay={310}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Details */}
        <Section delay={380} icon={<FileText size={16} />} title="Details">
          <div className="divide-y divide-neutralPrimary-100">
            <Rule label="Type" value={blog.type?.name ?? "—"} />
            <Rule
              label="Byline"
              value={blog.authorName || "—"}
              hint={
                blog.author && blog.author.name !== blog.authorName
                  ? `Account: ${blog.author.name}`
                  : undefined
              }
            />
            <Rule
              label="Featured"
              value={blog.featured ? "Yes" : "No"}
              hint="Highlighted on the blog page"
            />
            <Rule
              label="Comments"
              value={blog.allowComments ? "Open" : "Closed"}
              hint="New comments wait for approval"
            />
            {blog.videoUrl && (
              <Rule
                label="Video"
                value={
                  <a
                    href={blog.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blueSecondary-600 hover:underline"
                  >
                    <Video size={14} />
                    Open link
                  </a>
                }
              />
            )}
            <Rule
              label="Cover alt text"
              value={
                blog.bannerAlt ? (
                  <span className="line-clamp-2 font-normal text-neutralPrimary-600">
                    {blog.bannerAlt}
                  </span>
                ) : (
                  <span className="font-normal text-neutralPrimary-400">
                    {blog.bannerUrl ? "Not set" : "No cover"}
                  </span>
                )
              }
            />
          </div>
        </Section>

        <div className="space-y-4 sm:space-y-5">
          {/* Search preview */}
          <Section delay={440} icon={<Search size={16} />} title="Search Preview">
            <SearchPreview blog={blog} />
          </Section>

          {/* Tags */}
          <Section
            delay={500}
            icon={<Tag size={16} />}
            title="Tags"
            aside={
              blog.tags?.length > 0 && (
                <span className="text-xs font-semibold text-neutralPrimary-500">
                  {blog.tags.length}
                </span>
              )
            }
          >
            {blog.tags?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 rounded-full bg-greenPrimary-950 px-2.5 py-1 text-xs font-medium text-greenPrimary-700 transition-transform hover:scale-105"
                  >
                    <Hash size={11} />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-neutralPrimary-400">
                No tags added.
              </p>
            )}
          </Section>
        </div>
      </div>

      {/* Excerpt */}
      <Section delay={560} icon={<Newspaper size={16} />} title="Excerpt">
        {blog.excerpt ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-600">
            {blog.excerpt}
          </p>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            No excerpt. The listing card will show no teaser text.
          </p>
        )}
      </Section>

      {/* Body, styled like the storefront article */}
      <Section
        delay={620}
        icon={<FileText size={16} />}
        title="Content"
        aside={
          <span className="text-xs font-semibold text-neutralPrimary-500">
            {words.toLocaleString()} words
          </span>
        }
      >
        {/* Authored by an admin in the dashboard editor. */}
        <div
          className="max-h-[28rem] overflow-y-auto pr-1 text-sm leading-relaxed text-neutralPrimary-600 [&_a]:text-greenPrimary-500 [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutralPrimary-700 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-neutralPrimary-700 [&_img]:my-4 [&_img]:rounded-lg [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </Section>

      {/* Audit */}
      <div
        style={enterDelay(680)}
        className={`${ENTER} grid grid-cols-1 gap-3 rounded-xl bg-neutralPrimary-50 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4`}
      >
        <AuditRow
          label="Created"
          date={blog.createdAt}
          name={blog.createdBy?.name}
        />
        <AuditRow label="Published" date={blog.publishedAt} />
        <AuditRow
          label="Last Updated"
          date={blog.updatedAt}
          name={blog.updatedBy?.name}
        />
      </div>

      <div className="flex justify-end border-t border-neutralPrimary-100 pt-4">
        <CancelButton
          onClick={close}
          label="Close"
          className="w-full transition-all hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 hover:shadow-md active:translate-y-0 active:scale-95 sm:w-auto"
        />
      </div>
    </div>
  );
}
