"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NotebookPen } from "lucide-react";
import CustomPagination from "@/components/data-display/pagination/CustomPagination";
import CustomTabGroupPrimary from "@/components/primitives/tab/CustomTabGroupPrimary";
import Hero from "@/components/layout/hero/Hero";
import { ITabListPrimary } from "@/types";
import { formatDateDDMMYYYY } from "@/lib/utils/date.utils";
import { PUBLIC_BLOG_PAGE_SIZE } from "../../constants/blog.constants";
import { useActiveBlogTypes } from "../../hooks/useBlogType";
import { usePublicBlogs } from "../../hooks/usePublicBlog";
import { stripHtml } from "../../utils/html.utils";
import { BlogCardSkeleton } from "./BlogCardSkeleton";

export default function Blog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Tab and page live in the URL so a filtered listing stays shareable and the
   * back button steps through filters the way a visitor expects.
   */
  const page = Number(searchParams.get("page") ?? "1");
  const activeType = searchParams.get("type") ?? "";

  const { activeBlogTypes, isActiveBlogTypesLoading } = useActiveBlogTypes();
  const { blogs, meta, isBlogsLoading } = usePublicBlogs({
    page,
    limit: PUBLIC_BLOG_PAGE_SIZE,
    typeSlug: activeType || undefined,
  });

  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.totalItems ?? 0;
  const currentPage = meta?.currentPage ?? page;
  const itemsPerPage = meta?.itemsPerPage ?? PUBLIC_BLOG_PAGE_SIZE;

  // "Showing 1-9 from 24", the same counter the product listing shows.
  const fromRow = (currentPage - 1) * itemsPerPage + 1;
  const toRow = Math.min(currentPage * itemsPerPage, totalItems);

  const buildQuery = (next: { type?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.type !== undefined) {
      if (next.type) params.set("type", next.type);
      else params.delete("type");
      // Switching tabs has to reset paging, or tab 2 opens on a page that the
      // newly filtered result set may not have.
      params.delete("page");
    }

    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    // `scroll: false` then a manual scroll, so the jump to the top is smooth
    // rather than Next's instant one — matching the product listing.
    router.push(buildQuery({ page: nextPage }), { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * "All" carries an empty slug, which is also what "no filter" looks like in
   * the URL — so the two stay in step without a separate sentinel value.
   */
  const tabList: ITabListPrimary[] = [
    { label: "All", value: "" },
    ...activeBlogTypes.map((type) => ({
      label: type.name,
      value: type.slug,
      count: type.blogCount,
    })),
  ];

  return (
    <section className="w-full">
      <Hero heroHeading="Blog" />

      <main className="container mx-auto px-4">
        {/* ============ TYPE TABS ============ */}
        <div className="pt-8">
          {isActiveBlogTypesLoading ? (
            <div className="flex w-fit items-center gap-1 rounded-2xl border border-neutralPrimary-300/80 bg-neutralPrimary-100/70 p-1.5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-9 w-24 animate-pulse rounded-xl bg-neutralPrimary-200"
                />
              ))}
            </div>
          ) : (
            /**
             * Driven by the URL rather than internal tab state, so a filtered
             * listing stays shareable and the back button steps through
             * filters. The bar is used without `tabContent` because every tab
             * shows the same grid, re-fetched for that type.
             */
            <CustomTabGroupPrimary
              tabList={tabList}
              value={activeType}
              onValueChange={(next) =>
                router.push(buildQuery({ type: next }), { scroll: false })
              }
            />
          )}
        </div>

        {/* ============ BLOG GRID ============ */}
        <section className="py-10 flex flex-col gap-4">
          {/* Row counter, matching the product listing. */}
          {!isBlogsLoading && totalPages > 1 && (
            <div className="flex gap-1 text-sm text-neutralPrimary-500 font-medium">
              <span>Showing</span>{" "}
              <span>
                {fromRow}-{toRow}
              </span>{" "}
              <span>from</span> <span>{totalItems}</span>
            </div>
          )}

          {isBlogsLoading ? (
            <BlogCardSkeleton count={PUBLIC_BLOG_PAGE_SIZE} />
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog-details/${blog.slug}`}
                  className="group flex flex-col gap-3"
                >
                  {/* Cover image */}
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-neutral-100">
                    {blog.bannerUrl ? (
                      <Image
                        src={blog.bannerUrl}
                        alt={blog.bannerAlt || blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutralPrimary-400 text-sm">
                        No Image
                      </div>
                    )}

                    <span className="absolute top-0 left-0 bg-white text-neutralPrimary-700 text-xs font-semibold uppercase px-3 py-1.5">
                      {formatDateDDMMYYYY(blog.publishedAt ?? blog.createdAt)}
                    </span>
                  </div>

                  {/* Clamped: titles vary in length, and without a cap the
                      cards in a row stop lining up. */}
                  <h2 className="line-clamp-2 text-lg md:text-xl font-bold text-neutralPrimary-700 leading-snug group-hover:text-greenPrimary-500 transition-colors">
                    {blog.title}
                  </h2>

                  {/* The list payload omits `content` by design, so a card with
                      no excerpt simply shows none rather than a stand-in. */}
                  {blog.excerpt && (
                    <p className="line-clamp-2 text-neutralPrimary-500 text-sm">
                      {stripHtml(blog.excerpt)}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700 group-hover:text-greenPrimary-500 transition-colors">
                    <span>Read more</span>
                    <span aria-hidden>→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <NotebookPen className="w-10 h-10 text-neutralPrimary-400" />
              </div>
              <h3 className="text-xl font-bold text-neutralPrimary-700 mb-2">
                No Posts Yet
              </h3>
              <p className="text-neutralPrimary-500 text-center max-w-sm">
                {activeType
                  ? "There are no posts under this category right now. Try another one."
                  : "We haven't published anything here yet. Please check back soon."}
              </p>
            </div>
          )}
        </section>

        {/* ============ PAGINATION ============ */}
        {totalPages > 1 && (
          <div className="pb-12">
            <CustomPagination
              metaData={{
                totalItems,
                itemCount: meta?.itemCount ?? blogs.length,
                itemsPerPage,
                totalPages,
                currentPage,
              }}
              onPageChange={goToPage}
              isLoading={isBlogsLoading}
            />
          </div>
        )}
      </main>
    </section>
  );
}
