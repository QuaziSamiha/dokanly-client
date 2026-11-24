"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Lock, MessageSquareOff, Reply, ShieldCheck, X } from "lucide-react";
import InputField from "@/components/form/InputField";
import SubmitButton from "@/components/form/SubmitButton";
import TextAreaField from "@/components/form/TextAreaField";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { IUser } from "@/modules/user/types/user.types";
import { useCreateComment } from "../../hooks/useBlogComment";
import {
  CreateCommentSchema,
  CreateCommentType,
  CreateMemberCommentSchema,
} from "../../schemas/blog-comment.schema";

/** The comment a visitor is replying to. */
export interface IReplyTarget {
  id: number;
  authorName: string;
}

interface ICommentFormProps {
  slug: string;
  /** Post-level switch — the API rejects comments when this is false. */
  allowComments: boolean;
  replyTo?: IReplyTarget | null;
  onCancelReply?: () => void;
  onSubmitted?: () => void;
}

/**
 * The "Leave a Reply" form.
 *
 * Open to visitors: a guest fills in name and email, while a signed-in user is
 * identified by their token, so those two inputs are hidden and the lighter
 * member schema is used instead of sending values the API would ignore.
 */
export default function CommentForm({
  slug,
  allowComments,
  replyTo,
  onCancelReply,
  onSubmitted,
}: ICommentFormProps) {
  const { currentUserData } = useCurrentUser<IUser>();
  const isMember = Boolean(currentUserData?.id);

  /**
   * The member schema is a subset of the guest one, so its inferred output is
   * narrower than the form's field set. The form still owns all four fields —
   * the hidden ones are simply not validated — so the resolver is widened to
   * the guest shape rather than narrowing the form.
   */
  const resolver = zodResolver(
    isMember ? CreateMemberCommentSchema : CreateCommentSchema,
  ) as unknown as Resolver<CreateCommentType>;

  const { control, trigger, handleSubmit, reset } = useForm<CreateCommentType>({
    resolver,
    defaultValues: {
      content: "",
      guestName: "",
      guestEmail: "",
      guestWebsite: "",
    },
  });

  const { createComment, isSubmittingComment } = useCreateComment(slug, () => {
    reset();
    // Every comment lands as PENDING, so nothing appears in the thread yet —
    // say so instead of leaving the visitor wondering where their reply went.
    toast.info("Thanks! Your comment will appear once it has been approved.");
    onSubmitted?.();
  });

  const onSubmit = (data: CreateCommentType) => {
    const payload: Record<string, unknown> = { content: data.content };

    if (!isMember) {
      payload.guestName = data.guestName;
      payload.guestEmail = data.guestEmail;
    }

    // Sent as `undefined` rather than "" so the API's URL validator only runs
    // when the visitor actually typed a website.
    if (data.guestWebsite) {
      payload.guestWebsite = data.guestWebsite;
    }

    if (replyTo) payload.parentId = replyTo.id;

    createComment(payload);
  };

  if (!allowComments) {
    return (
      <div className="mt-12 flex items-center justify-center gap-2 rounded-2xl bg-neutralPrimary-50 px-6 py-6 text-sm text-neutralPrimary-500">
        <MessageSquareOff size={18} />
        Comments are closed for this post.
      </div>
    );
  }

  return (
    <section
      id="comment-form"
      className="mt-12 scroll-mt-28 rounded-3xl border border-neutralPrimary-200 bg-white p-5 shadow-sm sm:p-8"
      aria-labelledby="comment-form-heading"
    >
      <h3
        id="comment-form-heading"
        className="text-xl font-bold text-neutralPrimary-800 sm:text-2xl"
      >
        {replyTo ? "Write a reply" : "Leave a comment"}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutralPrimary-500">
        <Lock size={13} />
        Your email is never published. Comments appear after a quick review.
      </p>

      {replyTo && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-greenPrimary-950 px-4 py-2.5 text-sm text-greenPrimary-700">
          <span className="inline-flex min-w-0 items-center gap-2">
            <Reply size={15} className="shrink-0" />
            <span className="truncate">
              Replying to{" "}
              <span className="font-semibold">{replyTo.authorName}</span>
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-greenPrimary-500 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {isMember && (
        <p className="mt-5 flex items-center gap-2 text-sm text-neutralPrimary-600">
          <ShieldCheck size={16} className="text-greenPrimary-500" />
          Commenting as{" "}
          <span className="font-semibold">{currentUserData?.name}</span>
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col items-stretch gap-5"
      >
        <TextAreaField
          labelName={replyTo ? "Your reply" : "Your comment"}
          placeholderText="Share your thoughts or ask a question…"
          name="content"
          control={control}
          trigger={trigger}
          rowNo={5}
          isRequired
        />

        {/* A signed-in commenter is identified by their token, so name and
            email are neither asked for nor sent. */}
        {!isMember && (
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              labelName="Name"
              placeholderText="Your name"
              name="guestName"
              control={control}
              trigger={trigger}
              isRequired
            />
            <InputField
              labelName="Email"
              placeholderText="you@example.com"
              name="guestEmail"
              inputType="email"
              control={control}
              trigger={trigger}
              isRequired
            />
          </div>
        )}

        <InputField
          labelName="Website (optional)"
          placeholderText="https://"
          name="guestWebsite"
          control={control}
          trigger={trigger}
        />

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton
            submitTitle={replyTo ? "Post reply" : "Post comment"}
            isPending={isSubmittingComment}
          />
          {replyTo && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-sm font-semibold text-neutralPrimary-500 hover:text-neutralPrimary-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
