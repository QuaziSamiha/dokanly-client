"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  FileText,
  FolderOpen,
  ImageIcon,
  PenLine,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { CheckboxField } from "@/components/form/CheckboxField";
import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import TextAreaField from "@/components/form/TextAreaField";
import { TextEditor } from "@/components/form/TextEditor";
import { DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import {
  FieldHint,
  FormSection,
} from "@/modules/promotion/admin/PromotionFormParts";
import { IModal } from "@/types";
import {
  BLOG_BANNER_MAX_SIZE,
  BLOG_STATUS_OPTIONS,
} from "../constants/blog.constants";
import { useBlogDetails, useUpdateBlog } from "../hooks/useBlog";
import { useActiveBlogTypes } from "../hooks/useBlogType";
import { UpdateBlogSchema, UpdateBlogType } from "../schemas/blog.schema";
import { IBlogListItem } from "../types/blog.types";
import { buildBlogUpdateFormData } from "../utils/blog-form-data.utils";

export default function EditBlog({ setOpen, refetch, data }: IModal) {
  const rowData = data as IBlogListItem | undefined;

  // The table row carries no `content`, so the full post is fetched here.
  const { blog, isBlogDetailsLoading } = useBlogDetails(rowData?.id);
  const { activeBlogTypes, isActiveBlogTypesLoading } = useActiveBlogTypes();

  const typeOptions = activeBlogTypes.map((type) => ({
    id: String(type.id),
    name: type.isDefault ? `${type.name} (Default)` : type.name,
  }));

  const methods = useForm({
    resolver: zodResolver(UpdateBlogSchema),
    defaultValues: {
      title: "",
      slug: "",
      blogType: "",
      status: "DRAFT",
      excerpt: "",
      content: "",
      tags: "",
      authorName: "",
      readTime: null,
      featured: false,
      allowComments: true,
      banner: null,
      bannerAlt: "",
      videoUrl: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isDirty, dirtyFields },
  } = methods;

  /**
   * The post arrives after the form mounts, so seed it once it lands. `reset`
   * (rather than per-field `setValue`) is what re-baselines `dirtyFields`, so
   * the loaded values do not all count as edits.
   */
  useEffect(() => {
    if (!blog) return;

    reset({
      title: blog.title,
      slug: blog.slug,
      blogType: String(blog.type?.id ?? ""),
      status: blog.status,
      excerpt: blog.excerpt ?? "",
      content: blog.content,
      tags: blog.tags?.join(", ") ?? "",
      authorName: blog.authorName ?? "",
      readTime: blog.readTime ?? null,
      featured: blog.featured,
      allowComments: blog.allowComments,
      // Seeded with the saved URL so the picker shows the current cover rather
      // than an empty dropzone. `SingleMediaInput` previews a plain string, and
      // clearing it sets the field to null — which is how removal is detected.
      banner: blog.bannerUrl ?? null,
      bannerAlt: blog.bannerAlt ?? "",
      videoUrl: blog.videoUrl ?? "",
      metaTitle: blog.metaTitle ?? "",
      metaDescription: blog.metaDescription ?? "",
      metaKeywords: blog.metaKeywords?.join(", ") ?? "",
    });
  }, [blog, reset]);

  const { updateBlog, isUpdating } = useUpdateBlog(() => {
    setOpen?.(false);
    refetch?.();
  });

  const onSubmit = (formValues: UpdateBlogType) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    if (!rowData?.id) return;

    /**
     * Removal is read off the fields themselves rather than a separate toggle:
     * clearing the picker leaves `banner` null, and emptying the URL input
     * leaves `videoUrl` blank. Both only count when the field is dirty, so a
     * post that simply never had media is not sent a pointless remove flag.
     */
    const removeBanner = Boolean(dirtyFields.banner) && !formValues.banner;
    const removeVideo = Boolean(dirtyFields.videoUrl) && !formValues.videoUrl;

    updateBlog(
      rowData.id,
      buildBlogUpdateFormData(formValues, dirtyFields, {
        removeBanner,
        removeVideo,
      }),
    );
  };

  if (isBlogDetailsLoading) {
    return (
      <section className="flex min-w-0 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        {/* The modal opts out of its placeholder title, so this one names it. */}
        <DialogTitle className="text-lg font-semibold leading-tight text-neutralPrimary-800 sm:text-xl">
          Edit blog
        </DialogTitle>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }

  return (
    <FormProvider {...methods}>
      <CategoryFormDialog
        title="Edit blog"
        description={
          blog?.publishedAt
            ? "This post is live. Saved changes show on the blog right away."
            : "Not published yet. Set the status to Published to put it live."
        }
        submitLabel="Save changes"
        pendingLabel="Saving…"
        isPending={isUpdating}
        onSubmit={handleSubmit(onSubmit)}
        onClose={() => setOpen?.(false)}
      >
        <div className="flex w-full min-w-0 flex-col gap-4">
          <FormSection
            icon={<FileText size={15} />}
            title="Basics"
            description="The headline and teaser readers see on the blog listing."
          >
            <div className="md:col-span-2">
              <InputField
                labelName="Title"
                placeholderText="Enter blog title"
                name="title"
                control={control}
                trigger={trigger}
                isRequired
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                labelName="URL Slug"
                placeholderText="e.g. shikakai-ancient-cleanser"
                name="slug"
                control={control}
                trigger={trigger}
              />
            </div>
            <FieldHint>
              {blog?.publishedAt
                ? "This post is live, so changing the title keeps its URL. If you change the slug, the old link will redirect to the new one."
                : "Follows the title until the post is first published, unless you set it yourself."}
            </FieldHint>
            <div className="md:col-span-2">
              <TextAreaField
                labelName="Excerpt"
                placeholderText="Short teaser shown on the blog listing card"
                name="excerpt"
                control={control}
                trigger={trigger}
                rowNo={3}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<PenLine size={15} />}
            title="Content"
            description="The body of the post."
          >
            <div className="min-w-0 md:col-span-2">
              <TextEditor
                labelName="Content"
                name="content"
                control={control}
                trigger={trigger}
                isRequired
              />
            </div>
          </FormSection>

          <FormSection
            icon={<FolderOpen size={15} />}
            title="Details"
            description="Where the post is filed and who wrote it."
          >
            {/* The select resolves its label from the rendered options, so
                it must not mount before they arrive — otherwise a saved
                type shows as the placeholder. */}
            <SingleSelectSearch
              labelName="Blog Type"
              name="blogType"
              control={control}
              options={typeOptions}
              isLoading={isActiveBlogTypesLoading}
              isRequired
            />
            <SingleSelectSearch
              labelName="Status"
              name="status"
              control={control}
              options={BLOG_STATUS_OPTIONS}
              isRequired
            />
            <InputField
              labelName="Author Name"
              placeholderText="Shown as the byline"
              name="authorName"
              control={control}
              trigger={trigger}
            />
            <InputField
              labelName="Read Time (minutes)"
              placeholderText="e.g. 5"
              name="readTime"
              inputType="number"
              control={control}
              trigger={trigger}
            />
            <div className="md:col-span-2">
              <InputField
                labelName="Tags"
                placeholderText="Comma separated, e.g. shikakai, hair care"
                name="tags"
                control={control}
                trigger={trigger}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<ImageIcon size={15} />}
            title="Cover & media"
            description="The cover is cropped to 16:10 on the blog cards."
          >
            {/* The picker shows the current cover and owns its own remove
                control, so no separate "remove it" affordance is needed. */}
            <div className="md:col-span-2">
              <SingleMediaInput
                name="banner"
                label="Cover Image"
                control={control}
                maxFileSize={BLOG_BANNER_MAX_SIZE}
                acceptedFileTypes={["image/*"]}
              />
            </div>
            <InputField
              labelName="Cover Image Alt Text"
              placeholderText="e.g. Shikakai pods on a wooden table"
              name="bannerAlt"
              control={control}
              trigger={trigger}
            />
            <InputField
              labelName="Video URL"
              placeholderText="Optional — clear it to remove"
              name="videoUrl"
              control={control}
              trigger={trigger}
            />
          </FormSection>

          <FormSection icon={<Settings2 size={15} />} title="Options">
            <CheckboxField
              name="featured"
              label="Featured"
              control={control}
              setValue={setValue}
              getValues={getValues}
            />
            <CheckboxField
              name="allowComments"
              label="Allow Comments"
              description="New comments wait for approval before they show."
              control={control}
              setValue={setValue}
              getValues={getValues}
            />
          </FormSection>

          {/* --- SEO (hidden for now) ---
              The schema, defaults and payload wiring are all still in
              place, so restoring these inputs is just an uncomment. Values
              already saved on a post are left untouched, because the update
              payload only sends fields the form marks dirty.
          <FormSection icon={<Search size={15} />} title="SEO">
            <div className="md:col-span-2">
              <InputField
                labelName="Meta Title"
                placeholderText="Defaults to the blog title when left empty"
                name="metaTitle"
                control={control}
                trigger={trigger}
              />
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                labelName="Meta Description"
                placeholderText="Shown in search results"
                name="metaDescription"
                control={control}
                trigger={trigger}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                labelName="Meta Keywords"
                placeholderText="Comma separated"
                name="metaKeywords"
                control={control}
                trigger={trigger}
              />
            </div>
          </FormSection>
          --- end SEO --- */}
        </div>
      </CategoryFormDialog>
    </FormProvider>
  );
}
