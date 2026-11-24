"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import AddButton from "@/components/primitives/button/AddButton";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTabGroupPrimary from "@/components/primitives/tab/CustomTabGroupPrimary";
import CustomTable from "@/components/data-display/table/CustomTable";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { useConfirm } from "@/hooks/useConfirm";
import { ITabListPrimary } from "@/types";
import {
  BLOG_TAB_LIST,
  DEFAULT_BLOG_TAB,
} from "../constants/blog.constants";
import SegmentedFilter, {
  SegmentedOption,
} from "@/components/form/SegmentedFilter";
import { useBlogList, useBlogStats, useDeleteBlog } from "../hooks/useBlog";
import { BlogStatus, IBlogListItem, IBlogStats } from "../types/blog.types";
import { BLOG_STATUS_STYLES } from "../utils/blog-display.utils";
import AddBlog from "./AddBlog";
import BlogComments from "./BlogComments";
import BlogTypes from "./BlogTypes";
import EditBlog from "./EditBlog";
import ViewBlog from "./ViewBlog";
import { getBlogColumns } from "./blog.columns";

// Forms: near full-width on phones, a comfortable reading width on large
// screens. `p-0` lets the form's sticky header and footer sit flush.
const FORM_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] max-w-3xl p-0";
// Keeps the modal clear of the fixed 5rem admin navbar: with CustomModal2's
// mt-8 offset this leaves a 1.5rem gap below the navbar and 2.5rem at the bottom.
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";
// Edit and comments: the same fixed height on large screens, so the modal
// doesn't resize as content loads or filters change; capped and scrolling below.
const TALL_MODAL_HEIGHT =
  "max-h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-9rem)] scrollbar-brand";

// Status filter options, in the order a post moves through them.
const BLOG_STATUS_ORDER: BlogStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"];
const BLOG_STATUS_COUNT_KEY: Record<BlogStatus, keyof IBlogStats> = {
  PUBLISHED: "publishedBlogs",
  DRAFT: "draftBlogs",
  ARCHIVED: "archivedBlogs",
};

/** The blog post table — the first tab of the admin blog screen. */
function BlogList() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IBlogListItem>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<BlogStatus | undefined>();

  const { blogs, meta, isBlogLoading, refetchBlog } = useBlogList({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    sortOrder,
    status: statusFilter,
  });

  // The counts come from the stats endpoint, so they cover every post rather
  // than just the current page.
  const { stats } = useBlogStats();

  const statusOptions: SegmentedOption<BlogStatus>[] = [
    { value: undefined, label: "All", count: stats?.totalBlogs },
    ...BLOG_STATUS_ORDER.map((status) => ({
      value: status,
      label: BLOG_STATUS_STYLES[status].label,
      dot: BLOG_STATUS_STYLES[status].dot,
      title: BLOG_STATUS_STYLES[status].hint,
      count: stats?.[BLOG_STATUS_COUNT_KEY[status]],
    })),
  ];

  const { deleteBlog } = useDeleteBlog();

  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IBlogListItem) =>
    confirmDelete({
      title: "Delete this blog permanently?",
      description:
        "Its comments will be removed too. To keep it out of the storefront without losing it, set the status to Archived instead.",
      onConfirm: () => deleteBlog(data.id),
    });

  // Only the id is kept, so the modal header reads the post from the list and
  // its counts update after each moderation.
  const [commentsBlogId, setCommentsBlogId] = useState<number | null>(null);
  const commentsBlog = blogs.find((blog) => blog.id === commentsBlogId);

  const columns = getBlogColumns(
    (row) => handleOpen("view", row),
    (row) => handleOpen("edit", row),
    (row) => handleDeleteClick(row),
    (row) => setCommentsBlogId(row.id),
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">Blogs</p>
        <AddButton label="Add Blog" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth={FORM_MODAL_WIDTH}
          dialogHeight={FORM_MODAL_HEIGHT}
          hasOwnTitle
        >
          <AddBlog setOpen={setOpenModal} refetch={refetchBlog} />
        </CustomModal2>
      </section>

      <CustomTable<IBlogListItem>
        data={blogs}
        columns={columns}
        isLoading={isBlogLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(_field, order) => setSortOrder(order)}
        searchPlaceholder="Search blogs..."
        pageResetKey={`${statusFilter}|${searchTerm}`}
        toolbar={
          <SegmentedFilter
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(next) => {
              setStatusFilter(next);
              setCurrentPage(1);
            }}
          />
        }
      />

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={TALL_MODAL_HEIGHT}
        hasOwnTitle
      >
        <EditBlog
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchBlog}
          isLoading={isBlogLoading}
        />
      </CustomModal2>

      <CustomModal2
        open={isOpen("view")}
        onOpenChange={handleClose}
        dialogWidth="w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl"
        dialogHeight="max-h-[85vh] sm:max-h-[80vh] scrollbar-brand"
      >
        <ViewBlog
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
        />
      </CustomModal2>

      <CustomModal2
        open={!!commentsBlog}
        onOpenChange={(open) => !open && setCommentsBlogId(null)}
        dialogWidth="w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[70vw] max-w-6xl p-0"
        dialogHeight={TALL_MODAL_HEIGHT}
        hasOwnTitle
      >
        {commentsBlog && (
          <BlogComments
            // Remount per post, so filters and paging start fresh.
            key={commentsBlog.id}
            blog={commentsBlog}
            onClose={() => setCommentsBlogId(null)}
          />
        )}
      </CustomModal2>
    </section>
  );
}

export default function Blog() {
  const { stats } = useBlogStats();

  return (
    <section className="flex flex-col gap-6">
      {/* useSearchParams needs a Suspense boundary in the App Router. */}
      <Suspense
        fallback={
          <div className="flex w-fit items-center gap-1 rounded-2xl border border-neutralPrimary-300/80 bg-neutralPrimary-100/70 p-1.5">
            {BLOG_TAB_LIST.map((tab) => (
              <div
                key={tab.value}
                className="h-9 w-28 animate-pulse rounded-xl bg-neutralPrimary-200"
              />
            ))}
          </div>
        }
      >
        <BlogTabs stats={stats} />
      </Suspense>
    </section>
  );
}

const TAB_PARAM = "tab";

/** Same tab bar the Home Content screen uses, so the admin sections read as one system. */
function BlogTabs({ stats }: { stats?: IBlogStats }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The active tab lives in the URL (?tab=types), so a refresh or a shared
  // link opens the same tab. An unknown value falls back to the first tab.
  const requested = searchParams.get(TAB_PARAM);
  const activeTab = BLOG_TAB_LIST.some((tab) => tab.value === requested)
    ? (requested as string)
    : DEFAULT_BLOG_TAB;

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_BLOG_TAB) params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    const query = params.toString();
    // replace, not push: flipping tabs should not fill the back button history.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const counts: Record<string, number | undefined> = {
    blogs: stats?.totalBlogs,
  };

  const tabList: ITabListPrimary[] = BLOG_TAB_LIST.map(
    ({ icon: Icon, ...tab }) => ({
      ...tab,
      icon: <Icon />,
      count: counts[tab.value],
    }),
  );

  return (
    <CustomTabGroupPrimary
      tabList={tabList}
      tabContent={[
        { value: "blogs", content: <BlogList /> },
        { value: "types", content: <BlogTypes /> },
      ]}
      value={activeTab}
      onValueChange={handleTabChange}
      wrap
      rightSlot={
        <Link
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-neutralPrimary-300/80 bg-white px-4 py-2.5 text-sm font-medium text-neutralPrimary-600 transition-colors hover:border-greenPrimary-400 hover:text-greenPrimary-600 focus-visible:ring-2 focus-visible:ring-greenPrimary-500/60 focus-visible:outline-none"
        >
          <ExternalLink className="size-4" />
          View blog
        </Link>
      }
    />
  );
}
