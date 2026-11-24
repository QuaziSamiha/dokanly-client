"use client";

import React, { useState } from "react";
import { ExternalLink, MessageSquare, Pin, Reply } from "lucide-react";
import CustomPagination from "@/components/data-display/pagination/CustomPagination";
import { usePublicComments } from "../../hooks/useBlogComment";
import { IBlogComment } from "../../types/blog.types";
import { formatBlogDate } from "../../utils/blog-display.utils";
import CommentForm, { IReplyTarget } from "./CommentForm";

interface ICommentSectionProps {
  slug: string;
  allowComments: boolean;
  /** Approved count from the post, shown before the thread loads. */
  totalComments?: number;
}

// Stable avatar colour per name, so the same person always looks the same.
const AVATAR_TONES = [
  "from-greenPrimary-400 to-greenPrimary-600",
  "from-blueSecondary-400 to-blueSecondary-600",
  "from-warningPrimary-400 to-warningPrimary-600",
  "from-purpleSecondary-500 to-blueSecondary-700",
];
const toneFor = (name: string) =>
  AVATAR_TONES[
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
      AVATAR_TONES.length
  ];

function CommentAvatar({ name, small }: { name: string; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${toneFor(
        name,
      )} ${small ? "h-8 w-8 text-sm" : "h-10 w-10 text-base"}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function CommentItem({
  comment,
  isReply = false,
  onReply,
}: {
  comment: IBlogComment;
  isReply?: boolean;
  onReply?: (target: IReplyTarget) => void;
}) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <CommentAvatar name={comment.authorName} small={isReply} />
      <div className="min-w-0 flex-1">
        <div
          className={`rounded-2xl px-4 py-3 ${
            comment.isPinned
              ? "bg-greenPrimary-950 ring-1 ring-greenPrimary-200"
              : "bg-neutralPrimary-50"
          }`}
        >
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-neutralPrimary-800">
              {comment.website ? (
                <a
                  href={comment.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="inline-flex items-center gap-1 hover:text-greenPrimary-600"
                >
                  {comment.authorName}
                  <ExternalLink size={12} className="text-neutralPrimary-400" />
                </a>
              ) : (
                comment.authorName
              )}
            </span>
            {comment.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Pin size={10} /> Pinned
              </span>
            )}
            <time
              dateTime={comment.createdAt}
              className="text-xs text-neutralPrimary-400"
            >
              {formatBlogDate(comment.createdAt)}
            </time>
          </div>
          <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-neutralPrimary-600">
            {comment.content}
          </p>
        </div>

        {/* Replies are one level deep, so only top-level comments offer it. */}
        {!isReply && onReply && (
          <button
            type="button"
            onClick={() =>
              onReply({ id: comment.id, authorName: comment.authorName })
            }
            className="ml-2 mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-neutralPrimary-500 transition-colors hover:text-greenPrimary-600"
          >
            <Reply size={13} />
            Reply
          </button>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-l-2 border-neutralPrimary-100 pl-3 sm:pl-5">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The public thread plus the reply form.
 *
 * Only approved comments are served, pinned ones first (the API orders them),
 * so a visitor who just posted won't see their comment yet — the form says so.
 */
export default function CommentSection({
  slug,
  allowComments,
  totalComments: initialTotal = 0,
}: ICommentSectionProps) {
  const [page, setPage] = useState<number>(1);
  const [replyTo, setReplyTo] = useState<IReplyTarget | null>(null);

  const { comments, commentMeta, isCommentsLoading, refetchComments } =
    usePublicComments(slug, page);

  const totalPages = commentMeta?.totalPages ?? 1;
  const totalComments = commentMeta?.totalItems ?? initialTotal;

  const startReply = (target: IReplyTarget) => {
    setReplyTo(target);
    document
      .getElementById("comment-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      id="comments"
      className="mx-auto max-w-3xl scroll-mt-24 border-t border-neutralPrimary-100 pt-12 sm:pt-14"
      aria-labelledby="comments-heading"
    >
      <h2
        id="comments-heading"
        className="mb-8 flex items-center gap-3 text-2xl font-bold text-neutralPrimary-800 sm:text-3xl"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600">
          <MessageSquare size={20} />
        </span>
        {totalComments > 0
          ? `${totalComments} Comment${totalComments > 1 ? "s" : ""}`
          : "Comments"}
      </h2>

      {isCommentsLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-neutralPrimary-100" />
              <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-neutralPrimary-50 p-4">
                <div className="h-4 w-32 rounded bg-neutralPrimary-100" />
                <div className="h-3 w-full rounded bg-neutralPrimary-100" />
                <div className="h-3 w-4/5 rounded bg-neutralPrimary-100" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-7">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={allowComments ? startReply : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-neutralPrimary-200 px-6 py-10 text-center">
          <p className="font-semibold text-neutralPrimary-700">
            No comments yet
          </p>
          <p className="mt-1 text-sm text-neutralPrimary-500">
            {allowComments
              ? "Be the first to share your thoughts."
              : "Comments are closed for this post."}
          </p>
        </div>
      )}

      {!isCommentsLoading && totalPages > 1 && (
        <div className="pt-8">
          <CustomPagination
            metaData={{
              totalItems: commentMeta?.totalItems ?? 0,
              itemCount: commentMeta?.itemCount ?? comments.length,
              itemsPerPage: commentMeta?.itemsPerPage ?? 10,
              totalPages,
              currentPage: commentMeta?.currentPage ?? page,
            }}
            onPageChange={setPage}
          />
        </div>
      )}

      <CommentForm
        slug={slug}
        allowComments={allowComments}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSubmitted={() => {
          setReplyTo(null);
          refetchComments();
        }}
      />
    </section>
  );
}
