"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  FileText,
  FolderOpen,
  ImageIcon,
  PenLine,
  Settings2,
} from "lucide-react";
import { CheckboxField } from "@/components/form/CheckboxField";
import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import TextAreaField from "@/components/form/TextAreaField";
import { TextEditor } from "@/components/form/TextEditor";
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
import { useCreateBlog } from "../hooks/useBlog";
import { useActiveBlogTypes } from "../hooks/useBlogType";
import { CreateBlogSchema, CreateBlogType } from "../schemas/blog.schema";
import { buildBlogFormData } from "../utils/blog-form-data.utils";

export default function AddBlog({ setOpen, refetch }: IModal) {
  const { activeBlogTypes, isActiveBlogTypesLoading } = useActiveBlogTypes();

  const typeOptions = activeBlogTypes.map((type) => ({
    id: String(type.id),
    // Surface which type is the fallback, so it is obvious what a post with no
    // explicit type would be filed under.
    name: type.isDefault ? `${type.name} (Default)` : type.name,
  }));

  const methods = useForm({
    resolver: zodResolver(CreateBlogSchema),
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

  const { control, trigger, handleSubmit, reset, setValue, getValues } =
    methods;

  const { createBlog, isCreating } = useCreateBlog(() => {
    reset();
    setOpen?.(false);
    refetch?.();
  });

  const onSubmit = (data: CreateBlogType) => {
    createBlog(buildBlogFormData(data));
  };

  return (
    <FormProvider {...methods}>
      <CategoryFormDialog
        title="Add new blog"
        description="Save it as a draft to keep it private, or publish to put it live on the blog."
        submitLabel="Save post"
        pendingLabel="Saving…"
        isPending={isCreating}
        onSubmit={handleSubmit(onSubmit)}
        onClose={() => setOpen?.(false)}
      >
        <div className="flex w-full flex-col gap-4">
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
                placeholderText="Leave empty to build it from the title"
                name="slug"
                control={control}
                trigger={trigger}
              />
            </div>
            <FieldHint>
              The post&apos;s web address: /blog-details/your-slug. Required
              when the title is in Bangla. Lowercase English letters, numbers
              and hyphens only.
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
              placeholderText="Shown as the byline, e.g. Rahat"
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
              placeholderText="Optional video link"
              name="videoUrl"
              control={control}
              trigger={trigger}
            />
          </FormSection>

          <FormSection
            icon={<Settings2 size={15} />}
            title="Options"
          >
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
              defaultChecked
            />
          </FormSection>

          {/* --- SEO (hidden for now) ---
              The schema, defaults and payload wiring are all still in
              place, so restoring these inputs is just an uncomment.
          <FormSection
            icon={<Search size={15} />}
            title="SEO"
          >
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
