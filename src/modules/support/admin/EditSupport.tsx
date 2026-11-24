"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, ExternalLink, Info, PencilLine, X } from "lucide-react";
import SubmitButton from "@/components/form/SubmitButton";
import { TextEditor } from "@/components/form/TextEditor";
import { usePatch } from "@/hooks/api/usePatch";
import { usePost } from "@/hooks/api/usePost";
import { useConfirm } from "@/hooks/useConfirm";
import { IModal } from "@/types";
import { formatDate } from "@/lib/utils/date.utils";
import {
  supportSchema,
  SupportType,
} from "@/modules/support/schemas/support.schema";
import {
  ISupport,
  SupportPolicyType,
} from "@/modules/support/types/support.types";
import {
  POLICY_MIN_WORDS,
  SUPPORT_POLICIES,
} from "@/modules/support/constants/support.constants";
import {
  formatTimeAgo,
  getContentStats,
  preparePolicyHtml,
} from "@/modules/support/utils/support.utils";
import PolicyContent from "@/modules/support/public/PolicyContent";

export interface ISupportEditTarget {
  type: SupportPolicyType;
  record?: ISupport;
}

type EditorTab = "write" | "preview";

export default function EditSupport({ setOpen, refetch, data }: IModal) {
  const target = data as ISupportEditTarget | undefined;
  const record = target?.record;
  const meta = SUPPORT_POLICIES.find((p) => p.type === target?.type);
  const isCreate = !record;

  const [tab, setTab] = useState<EditorTab>("write");

  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm<SupportType>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      description: record?.description ?? "",
    },
  });

  const description = useWatch({ control, name: "description" });
  const stats = getContentStats(description);

  const closeModal = () => setOpen?.(false);

  const onSaved = (response: { statusCode: number }) => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      closeModal();
      refetch?.();
    }
  };

  const { mutate: updateSupport, isPending: isUpdatePending } = usePatch(
    onSaved,
    (error) => console.error("Update failed:", error),
  );
  const { mutate: createSupport, isPending: isCreatePending } = usePost(
    `/support/create-support`,
    onSaved,
    (error) => console.error("Create failed:", error),
  );

  const { confirm } = useConfirm();

  const handleCancel = async () => {
    if (
      isDirty &&
      !(await confirm({
        title: "Discard your unsaved changes?",
        description: "Your edits to this policy will be lost.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        variant: "warning",
      }))
    ) {
      return;
    }
    closeModal();
  };

  const onSubmit = (formData: SupportType) => {
    if (isCreate) {
      createSupport({ type: target?.type, description: formData.description });
      return;
    }

    if (!isDirty || !dirtyFields.description) {
      toast.info("No changes detected!");
      closeModal();
      return;
    }

    updateSupport({
      endpoint: `/support/update-support/${record.id}`,
      data: { description: formData.description },
    });
  };

  if (!meta) return null;
  const Icon = meta.icon;
  const lastEditor = record?.updatedBy ?? record?.createdBy;
  const lastEditedAt = record?.updatedAt ?? record?.createdAt;

  return (
    <section className="flex max-h-[calc(90vh-2rem)] flex-col">
      {/* --- Header --- */}
      <header className="flex items-start gap-4 border-b px-6 py-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.iconTone}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-neutralPrimary-800">
            {isCreate ? "Set up" : "Edit"} {meta.title}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-neutral-500">
            <span>Shown at</span>
            <Link
              href={meta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-greenPrimary-600 hover:underline"
            >
              {meta.href}
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close"
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* --- Body --- */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex items-start gap-2 rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            <Info className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
            <p>
              {meta.summary} Use a bold line on its own for each section
              heading, and lists for steps or conditions so customers can scan
              the page.
            </p>
          </div>

          {/* --- Write / Preview tabs --- */}
          <div
            role="tablist"
            className="inline-flex w-fit rounded-lg border border-neutral-200 bg-neutral-50 p-1"
          >
            {(
              [
                { id: "write", label: "Write", icon: PencilLine },
                { id: "preview", label: "Customer preview", icon: Eye },
              ] as const
            ).map(({ id, label, icon: TabIcon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === id
                    ? "bg-white text-neutralPrimary-800 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <TabIcon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {/* * Kept mounted while previewing so the editor keeps its state. */}
          <div className={tab === "write" ? "" : "hidden"}>
            <TextEditor
              labelName="Policy content"
              name="description"
              control={control}
              trigger={trigger}
              placeholderText={`Write the ${meta.title.toLowerCase()} customers will read...`}
              isRequired
            />
          </div>

          {tab === "preview" && (
            <div className="rounded-lg border border-neutral-200 bg-white px-6 py-5">
              <h3 className="mb-4 border-b-2 border-neutral-300 pb-3 text-2xl font-bold text-neutralPrimary-700">
                {meta.title}
              </h3>
              {stats.words > 0 ? (
                <PolicyContent html={preparePolicyHtml(description).html} />
              ) : (
                <p className="text-sm text-neutral-400">Nothing to preview yet.</p>
              )}
            </div>
          )}

          {/* --- Content stats --- */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span>
              <span className="font-semibold text-neutral-700">
                {stats.words.toLocaleString()}
              </span>{" "}
              words
            </span>
            <span>
              <span className="font-semibold text-neutral-700">{stats.sections}</span>{" "}
              sections
            </span>
            <span>~{stats.readMinutes} min read</span>
            {stats.words > 0 && stats.words < POLICY_MIN_WORDS && (
              <span className="font-medium text-amber-700">
                Short for a policy page. Aim for at least {POLICY_MIN_WORDS} words.
              </span>
            )}
          </div>
        </div>

        {/* --- Footer --- */}
        <footer className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-neutral-500">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                <span className="size-2 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : record ? (
              <span title={lastEditedAt ? formatDate(lastEditedAt) : undefined}>
                Last updated {formatTimeAgo(lastEditedAt)}
                {lastEditor?.name && (
                  <>
                    {" "}by{" "}
                    <span className="font-medium text-neutral-700">
                      {lastEditor.name}
                    </span>
                  </>
                )}
                {record.createdBy?.name &&
                  ` · Created ${formatDate(record.createdAt)} by ${record.createdBy.name}`}
              </span>
            ) : (
              "Not published yet"
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 md:text-base"
            >
              Cancel
            </button>
            <SubmitButton
              submitTitle={isCreate ? "Publish page" : "Save changes"}
              isPending={isUpdatePending || isCreatePending}
              buttonWidth="w-auto"
            />
          </div>
        </footer>
      </form>
    </section>
  );
}
