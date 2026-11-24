"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import SubmitButton from "@/components/form/SubmitButton";
import { TextEditor } from "@/components/form/TextEditor";
import { getBaseUrl } from "@/config/env.config";
import { IModal } from "@/types";
import {
  MEDIA_NEWS_CATEGORY_OPTIONS,
  MEDIA_NEWS_STATUS_OPTIONS,
} from "../constants/media-news.constants";
import { useUpdateMediaNews } from "../hooks/useMediaNews";
import {
  UpdateMediaNewsSchema,
  UpdateMediaNewsType,
} from "../schemas/media-news.schema";
import { IMediaNews } from "../types/media-news.types";
import SourceUrls from "./SourceUrls";

export default function EditMediaNews({
  setOpen,
  refetch,
  data,
  isLoading,
}: IModal) {
  const rowData = data as IMediaNews;
  const url = getBaseUrl();

  /**
   * A video stored by us comes back as an upload URL, anything else is an
   * external link — the form has to seed the right one of the two inputs.
   */
  const isUploadedVideo = Boolean(
    rowData?.videoUrl?.includes("/uploads/") ||
      rowData?.videoUrl?.startsWith(url),
  );

  const methods = useForm({
    resolver: zodResolver(UpdateMediaNewsSchema),
    defaultValues: {
      title: rowData?.title ?? "",
      description: rowData?.description ?? "",
      status: rowData?.status ?? "",
      category: rowData?.category ?? "",
      sourceUrls: rowData?.sourceUrls?.map((url) => ({ url })) ?? [{ url: "" }],
      media: rowData?.mediaUrl
        ? { filePath: rowData.mediaUrl, name: rowData.title ?? "Media" }
        : null,
      videoFile: isUploadedVideo
        ? { filePath: rowData.videoUrl, name: rowData.title ?? "Media" }
        : null,
      videoUrl: isUploadedVideo ? "" : rowData?.videoUrl,
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = methods;

  const { updateMediaNews, isUpdating } = useUpdateMediaNews(() => {
    setOpen?.(false);
    refetch?.();
  });

  const onSubmit = (data: UpdateMediaNewsType) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    // Only the touched fields go up — the endpoint patches what it receives.
    const formData = new FormData();

    if (dirtyFields.title) {
      formData.append("title", data.title);
    }
    if (dirtyFields.description) {
      formData.append("description", data.description);
    }
    if (dirtyFields.media && data.media instanceof File) {
      formData.append("mediaFile", data.media);
    } else if (rowData?.mediaUrl && data.media === null) {
      // "null" tells the backend to drop the stored file.
      formData.append("mediaFile", "null");
    }
    if (dirtyFields.status) {
      formData.append("status", data?.status ?? "");
    }
    if (dirtyFields.category) {
      formData.append("category", data?.category ?? "");
    }
    if (dirtyFields.videoFile && data.videoFile instanceof File) {
      formData.append("videoFile", data.videoFile);
    } else if (
      dirtyFields.videoFile &&
      isUploadedVideo &&
      data?.videoFile === null
    ) {
      formData.append("videoFile", "null");
    }
    if (dirtyFields.videoUrl && data.videoUrl && data.videoUrl.trim() !== "") {
      formData.append("videoUrl", data.videoUrl);
    } else if (dirtyFields.videoUrl && data.videoUrl === "") {
      formData.append("videoUrl", "");
    }
    if (dirtyFields.sourceUrls) {
      const urls = (data.sourceUrls || []).map((u) => u.url).filter(Boolean);
      formData.append("sourceUrls", JSON.stringify(urls));
    }

    updateMediaNews(rowData.id, formData);
  };

  return (
    <section className="w-full p-6 max-h-[80vh] overflow-y-auto">
      <p className="text-2xl font-semibold text-neutralPrimary-800 border-b pb-3 mb-6">
        Edit Media & News
      </p>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-start gap-6"
        >
          <InputField
            labelName="Title"
            name="title"
            placeholderText="Media & News Title..."
            control={control}
            trigger={trigger}
            isRequired
            isLoading={isLoading}
          />
          <div className="flex items-center gap-6 w-full">
            <SingleSelectSearch
              labelName="Status"
              name="status"
              control={control}
              options={MEDIA_NEWS_STATUS_OPTIONS}
              isRequired
              isLoading={isLoading}
            />
            <SingleSelectSearch
              labelName="Category"
              name="category"
              control={control}
              options={MEDIA_NEWS_CATEGORY_OPTIONS}
              isRequired
              isLoading={isLoading}
              isDisabled={true}
            />
          </div>
          <TextEditor
            labelName="Description"
            placeholderText="Enter Product Description"
            name="description"
            control={control}
            trigger={trigger}
            isRequired
            isLoading={isLoading}
          />
          <SourceUrls />
          <SingleMediaInput
            name="media"
            label="Media"
            control={control}
            maxFileSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={["image/*"]} // Only images
          />
          <SingleMediaInput
            name="videoFile"
            label="Video File"
            control={control}
            maxFileSize={150 * 1024 * 1024} // 150MB
            acceptedFileTypes={["video/*"]} // Only videos
          />
          <InputField
            labelName="Video URL"
            name="videoUrl"
            placeholderText="Enter Video URL"
            control={control}
            trigger={trigger}
            isLoading={isLoading}
          />
          <SubmitButton submitTitle="Save" isPending={isUpdating} />
        </form>
      </FormProvider>
    </section>
  );
}
