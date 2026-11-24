"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock,
  // Eye, // view count hidden — TD-1 in docs/blog.md
  Hash,
  Leaf,
  MessageSquare,
  NotebookPen,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { usePublicBlogDetails } from "../../hooks/usePublicBlog";
import { IBlog } from "../../types/blog.types";
import { getVideoEmbed, prepareArticle } from "../../utils/blog-content.utils";
import {
  blogPublicPath,
  countWords,
  editedAfterPublish,
  estimateReadMinutes,
  formatBlogDate,
  // formatCompact, // view count hidden — TD-1 in docs/blog.md
} from "../../utils/blog-display.utils";
import { BlogDetailsSkeleton } from "./BlogDetailsSkeleton";
import CommentSection from "./CommentSection";
import ReadingProgress from "./ReadingProgress";
import RelatedBlog from "./RelatedBlog";
import ShareButtons from "./ShareButtons";
import { MobileTableOfContents, TableOfContents } from "./TableOfContents";

/**
 * Article typography. Headings get a scroll margin so a table-of-contents jump
 * does not hide them under the sticky navbar.
 */
const ARTICLE_BODY =
  "blog-content break-words text-[16px] sm:text-[17px] leading-[1.8] text-neutralPrimary-600 " +
  "[&>p:first-child]:text-lg [&>p:first-child]:sm:text-xl [&>p:first-child]:leading-relaxed [&>p:first-child]:text-neutralPrimary-700 " +
  "[&_p]:mb-5 " +
  "[&_h2]:scroll-mt-28 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:sm:text-[1.75rem] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-neutralPrimary-800 " +
  "[&_h3]:scroll-mt-28 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-neutralPrimary-800 " +
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:pl-1 [&_li]:marker:text-greenPrimary-500 " +
  "[&_a]:font-medium [&_a]:text-greenPrimary-600 [&_a]:underline [&_a]:decoration-greenPrimary-300 [&_a]:underline-offset-4 [&_a:hover]:decoration-greenPrimary-600 " +
  "[&_strong]:font-semibold [&_strong]:text-neutralPrimary-800 " +
  "[&_blockquote]:my-8 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-greenPrimary-500 [&_blockquote]:bg-greenPrimary-950 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-lg [&_blockquote]:italic [&_blockquote]:text-neutralPrimary-700 " +
  "[&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl " +
  "[&_iframe]:my-8 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-2xl " +
  "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-neutralPrimary-800 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white " +
  "[&_table]:my-6 [&_table]:block [&_table]:overflow-x-auto [&_td]:border [&_td]:border-neutralPrimary-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-neutralPrimary-200 [&_th]:bg-neutralPrimary-50 [&_th]:px-3 [&_th]:py-2 " +
  "[&_hr]:my-10 [&_hr]:border-neutralPrimary-200";

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-greenPrimary-500">{icon}</span>
      {children}
    </span>
  );
}

function AuthorAvatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-greenPrimary-400 to-greenPrimary-600 font-bold text-white shadow-sm ${
        size === "lg" ? "h-14 w-14 text-xl" : "h-10 w-10 text-base"
      }`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/** The post's video: embedded player, native player, or a link card. */
function PostVideo({ url, title }: { url?: string; title: string }) {
  const video = getVideoEmbed(url);
  if (!video) return null;

  return (
    <section aria-label="Video" className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutralPrimary-800">
        <PlayCircle size={20} className="text-greenPrimary-500" />
        Watch
      </h2>
      {video.kind === "iframe" && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
          <iframe
            src={video.src}
            title={`${video.title}: ${title}`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {video.kind === "file" && (
        <video
          controls
          preload="metadata"
          className="aspect-video w-full rounded-2xl bg-black shadow-lg"
        >
          <source src={video.src} />
        </video>
      )}
      {video.kind === "link" && (
        <a
          href={video.src}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-neutralPrimary-200 p-4 transition-all hover:border-greenPrimary-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600">
            <PlayCircle size={24} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-neutralPrimary-800">
              Watch the video
            </span>
            <span className="block truncate text-sm text-neutralPrimary-500">
              {video.src}
            </span>
          </span>
          <ArrowRight
            size={18}
            className="ml-auto shrink-0 text-neutralPrimary-400 transition-transform group-hover:translate-x-1"
          />
        </a>
      )}
    </section>
  );
}

/** A nudge from reading to shopping — the reason an e-commerce blog exists. */
function ShopCallout({ typeName }: { typeName?: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-greenPrimary-600 to-greenPrimary-800 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
      <Leaf
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rotate-12 text-white/10"
      />
      <Leaf
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 -rotate-45 text-white/5"
      />
      <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-greenPrimary-200">
            Natura Care
          </p>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            Put these tips into practice
          </h2>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Gentle, plant-based {typeName ? typeName.toLowerCase() : "care"}{" "}
            made for everyday use. Find the right product for your routine.
          </p>
        </div>
        <Link
          href="/product"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-greenPrimary-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          Shop products
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border-2 border-dashed border-neutralPrimary-200 bg-neutralPrimary-50/60 px-6 py-14 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <NotebookPen className="h-8 w-8 text-greenPrimary-500" />
        </span>
        <h1 className="mb-2 text-2xl font-bold text-neutralPrimary-800">
          Post not found
        </h1>
        <p className="mb-8 text-neutralPrimary-500">
          This post may have been removed, or it isn&apos;t published yet.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-greenPrimary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-greenPrimary-600"
          >
            <ArrowLeft size={18} />
            Back to blog
          </Link>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-full border border-neutralPrimary-300 px-6 py-3 font-semibold text-neutralPrimary-700 transition-colors hover:border-greenPrimary-500 hover:text-greenPrimary-600"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}

function Article({ blog }: { blog: IBlog }) {
  const articleRef = useRef<HTMLElement>(null);
  const { html, headings } = useMemo(
    () => prepareArticle(blog.content),
    [blog.content],
  );
  const readMinutes =
    blog.readTime ?? estimateReadMinutes(countWords(blog.content));
  const edited = editedAfterPublish(blog.publishedAt, blog.updatedAt);
  const path = blogPublicPath(blog.slug);

  return (
    <>
      <ReadingProgress targetRef={articleRef} />

      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden bg-gradient-to-b from-greenPrimary-950 via-white to-white">
        <div className="container mx-auto px-4 pb-8 pt-16 sm:pb-10 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
              <ol className="flex min-w-0 items-center gap-1.5 text-sm text-neutralPrimary-500">
                <li>
                  <Link href="/" className="transition-colors hover:text-greenPrimary-600">
                    Home
                  </Link>
                </li>
                <ChevronRight size={14} className="shrink-0 text-neutralPrimary-300" />
                <li>
                  <Link href="/blog" className="transition-colors hover:text-greenPrimary-600">
                    Blog
                  </Link>
                </li>
                {blog.type && (
                  <>
                    <ChevronRight size={14} className="shrink-0 text-neutralPrimary-300" />
                    <li className="min-w-0">
                      <Link
                        href={`/blog?type=${blog.type.slug}`}
                        className="block truncate transition-colors hover:text-greenPrimary-600"
                      >
                        {blog.type.name}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {blog.type && (
              <Link
                href={`/blog?type=${blog.type.slug}`}
                className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-greenPrimary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-greenPrimary-700 transition-colors hover:bg-greenPrimary-500 hover:text-white"
              >
                <Leaf size={12} />
                {blog.type.name}
              </Link>
            )}

            <h1 className="text-[1.875rem] font-extrabold leading-[1.15] tracking-tight text-neutralPrimary-900 sm:text-4xl lg:text-5xl">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-neutralPrimary-500 sm:mt-5 sm:text-xl">
                {blog.excerpt}
              </p>
            )}

            {/* Byline + facts */}
            <div className="mt-6 flex flex-col gap-4 border-t border-neutralPrimary-100 pt-6 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AuthorAvatar name={blog.authorName || "Natura Care"} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutralPrimary-800">
                    {blog.authorName || "Natura Care"}
                  </p>
                  <p className="text-sm text-neutralPrimary-500">
                    {formatBlogDate(blog.publishedAt ?? blog.createdAt)}
                    {edited && (
                      <span className="text-neutralPrimary-400">
                        {" "}
                        · Updated {formatBlogDate(blog.updatedAt)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutralPrimary-500">
                <MetaItem icon={<Clock size={15} />}>{readMinutes} min read</MetaItem>
                {/* View count hidden until counting is accurate — see TD-1 in
                    docs/blog.md. Restore this block and the `Eye` /
                    `formatCompact` imports once it is fixed.
                {blog.viewCount > 0 && (
                  <MetaItem icon={<Eye size={15} />}>
                    {formatCompact(blog.viewCount)} views
                  </MetaItem>
                )} */}
                <a href="#comments" className="transition-colors hover:text-greenPrimary-600">
                  <MetaItem icon={<MessageSquare size={15} />}>
                    {blog.totalComments}{" "}
                    {blog.totalComments === 1 ? "comment" : "comments"}
                  </MetaItem>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ COVER ============ */}
      {blog.bannerUrl && (
        <div className="container mx-auto px-0 sm:px-4">
          <figure className="relative mx-auto aspect-[4/3] w-full max-w-5xl overflow-hidden bg-neutralPrimary-100 sm:aspect-[16/9] sm:rounded-3xl sm:shadow-xl">
            <Image
              src={blog.bannerUrl}
              alt={blog.bannerAlt || blog.title}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </figure>
        </div>
      )}

      {/* ============ BODY + SIDEBAR ============ */}
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
          <article ref={articleRef} className="mx-auto w-full max-w-3xl lg:mx-0 lg:max-w-none">
            <div className="mb-8 lg:hidden">
              <MobileTableOfContents headings={headings} />
            </div>

            {/* Rich text authored by an admin in the dashboard editor — the
                same trusted-author path the rest of the site uses. */}
            <div
              className={ARTICLE_BODY}
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <PostVideo url={blog.videoUrl} title={blog.title} />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 rounded-full bg-neutralPrimary-100 px-3 py-1.5 text-sm font-medium text-neutralPrimary-600"
                  >
                    <Hash size={13} className="text-greenPrimary-500" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-neutralPrimary-200 bg-neutralPrimary-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-neutralPrimary-800">
                  Found this helpful?
                </p>
                <p className="text-sm text-neutralPrimary-500">
                  Share it with someone who&apos;d love it too.
                </p>
              </div>
              <ShareButtons title={blog.title} path={path} />
            </div>

            {/* Author */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-neutralPrimary-200 p-5 sm:p-6">
              <AuthorAvatar name={blog.authorName || "Natura Care"} size="lg" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-neutralPrimary-400">
                  Written by
                </p>
                <p className="text-lg font-bold text-neutralPrimary-800">
                  {blog.authorName || "Natura Care"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutralPrimary-500">
                  Part of the Natura Care team, sharing simple, natural ways to
                  care for your hair and skin.
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutralPrimary-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={13} />
                    Published {formatBlogDate(blog.publishedAt ?? blog.createdAt)}
                  </span>
                  {edited && (
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw size={13} />
                      Updated {formatBlogDate(blog.updatedAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </article>

          {/* Sticky sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-8">
              <TableOfContents headings={headings} />
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutralPrimary-400">
                  Share
                </p>
                <ShareButtons title={blog.title} path={path} />
              </div>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-neutralPrimary-600 transition-colors hover:text-greenPrimary-600"
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />
                All posts
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ============ SHOP CTA ============ */}
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <ShopCallout typeName={blog.type?.name} />
        </div>
      </div>

      {/* ============ RELATED ============ */}
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <RelatedBlog slug={blog.slug} typeSlug={blog.type?.slug} />
        </div>
      </div>

      {/* ============ COMMENTS ============ */}
      <div className="container mx-auto px-4 pb-16">
        <CommentSection
          slug={blog.slug}
          allowComments={blog.allowComments}
          totalComments={blog.totalComments}
        />
      </div>
    </>
  );
}

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { blog, isBlogLoading } = usePublicBlogDetails(slug);

  // An old link to a post whose slug has since changed still loads it (the API
  // follows the redirect); swap the address bar to the current URL so it is
  // the one that gets shared and bookmarked. The server-side 308 in the page
  // already covers crawlers; this catches client-side navigations.
  useEffect(() => {
    if (blog && slug && blog.slug !== decodeURIComponent(slug)) {
      router.replace(blogPublicPath(blog.slug));
    }
  }, [blog, slug, router]);

  return (
    <section className="w-full bg-white">
      {isBlogLoading ? (
        <BlogDetailsSkeleton />
      ) : blog ? (
        <Article blog={blog} />
      ) : (
        // The API 404s drafts and archived posts here, so a missing post
        // means "not published", not merely "not found".
        <NotFound />
      )}
    </section>
  );
}
