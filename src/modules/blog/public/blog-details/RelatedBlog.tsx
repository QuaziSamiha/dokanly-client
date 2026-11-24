"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, ImageOff } from "lucide-react";
import { stripHtml } from "@/lib/utils/html.utils";
import { useRelatedBlogs } from "../../hooks/usePublicBlog";
import {
  blogPublicPath,
  formatBlogDate,
} from "../../utils/blog-display.utils";

interface IRelatedBlogProps {
  slug: string;
  /** Type of the current post, for the "see all" link. */
  typeSlug?: string;
}

/**
 * "Keep reading" strip. The API picks these by blog type and already excludes
 * the post being viewed, so no client-side filtering is needed.
 */
export default function RelatedBlog({ slug, typeSlug }: IRelatedBlogProps) {
  const { relatedBlogs, isRelatedLoading } = useRelatedBlogs(slug);

  // Nothing related — drop the whole section rather than show an empty heading.
  if (!isRelatedLoading && relatedBlogs.length === 0) return null;

  return (
    <section className="py-14 sm:py-16" aria-labelledby="related-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-greenPrimary-500">
            Keep reading
          </p>
          <h2
            id="related-heading"
            className="text-2xl font-bold text-neutralPrimary-800 sm:text-3xl"
          >
            Related posts
          </h2>
        </div>
        <Link
          href={typeSlug ? `/blog?type=${typeSlug}` : "/blog"}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700"
        >
          See all
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Swipeable row on phones, a grid from tablets up. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-8 [&::-webkit-scrollbar]:hidden">
        {isRelatedLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex w-[80%] shrink-0 snap-start flex-col gap-3 sm:w-auto"
              >
                <div className="aspect-16/10 animate-pulse rounded-2xl bg-neutralPrimary-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutralPrimary-100" />
                <div className="h-5 w-full animate-pulse rounded bg-neutralPrimary-100" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-neutralPrimary-100" />
              </div>
            ))
          : relatedBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={blogPublicPath(blog.slug)}
                className="group flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-neutralPrimary-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-greenPrimary-200 hover:shadow-xl sm:w-auto"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-neutralPrimary-100">
                  {blog.bannerUrl ? (
                    <Image
                      src={blog.bannerUrl}
                      alt={blog.bannerAlt || blog.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutralPrimary-300">
                      <ImageOff size={28} />
                    </div>
                  )}
                  {blog.type && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-greenPrimary-700 shadow-sm">
                      {blog.type.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="flex items-center gap-2 text-xs text-neutralPrimary-400">
                    <span>{formatBlogDate(blog.publishedAt ?? blog.createdAt)}</span>
                    {blog.readTime && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {blog.readTime} min
                        </span>
                      </>
                    )}
                  </p>
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug text-neutralPrimary-800 transition-colors group-hover:text-greenPrimary-600">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="line-clamp-2 text-sm text-neutralPrimary-500">
                      {stripHtml(blog.excerpt)}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-greenPrimary-600">
                    Read article
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
