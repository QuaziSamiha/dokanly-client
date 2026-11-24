"use client";

import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import SubmitButton from "@/components/form/SubmitButton";
import TextAreaField from "@/components/form/TextAreaField";
import { IModal } from "@/types";
import {
  MEDIA_NEWS_CATEGORY_OPTIONS,
  MEDIA_NEWS_STATUS_OPTIONS,
} from "../constants/media-news.constants";
import { useCreateMediaNews } from "../hooks/useMediaNews";
import {
  CreateMediaNewsSchema,
  CreateMediaNewsType,
} from "../schemas/media-news.schema";
import SourceUrls from "./SourceUrls";

export default function AddMediaNews({ setOpen, refetch }: IModal) {
  const methods = useForm({
    resolver: zodResolver(CreateMediaNewsSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "",
      category: "",
      sourceUrls: [{ url: "" }],
      media: null,
      videoFile: null,
      videoUrl: "",
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
  } = methods;

  const videoFile = watch("videoFile");
  const videoUrl = watch("videoUrl");

  // Flag the videoFile/videoUrl conflict as the user types, and clear it again
  // as soon as one of the two is removed.
  useEffect(() => {
    if (videoFile && videoUrl && videoUrl.trim() !== "") {
      setError("videoFile", {
        type: "manual",
        message: "Please remove video URL to upload a video file",
      });
      setError("videoUrl", {
        type: "manual",
        message: "Please remove video file to add a video URL",
      });
    } else {
      clearErrors("videoFile");
      clearErrors("videoUrl");
    }
  }, [videoFile, videoUrl, setError, clearErrors]);

  const { createMediaNews, isCreating } = useCreateMediaNews(() => {
    reset();
    refetch?.();
    setOpen?.(false);
  });

  const onSubmit = (data: CreateMediaNewsType) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data?.description || "");
    formData.append("category", String(data.category));
    formData.append("status", data?.status);

    const validSourceUrls = data.sourceUrls
      .filter((source) => source.url.trim() !== "")
      .map((source) => source.url);

    formData.append("sourceUrls", JSON.stringify(validSourceUrls));

    if (data.media && data.media instanceof File) {
      formData.append("mediaFile", data.media);
    }

    // A video is either an upload or a link, never both.
    if (data.videoFile && data.videoFile instanceof File) {
      formData.append("videoFile", data.videoFile);
    } else if (data.videoUrl && data.videoUrl.trim() !== "") {
      formData.append("videoUrl", data.videoUrl);
    }

    createMediaNews(formData);
  };

  return (
    <section className="w-full p-6">
      <p className="text-2xl font-semibold text-neutralPrimary-800 border-b pb-3 mb-6">
        New Media & News
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
          />
          <div className="flex items-center gap-6 w-full">
            <SingleSelectSearch
              labelName="Status"
              name="status"
              control={control}
              options={MEDIA_NEWS_STATUS_OPTIONS}
              isRequired
            />
            <SingleSelectSearch
              labelName="Category"
              name="category"
              control={control}
              options={MEDIA_NEWS_CATEGORY_OPTIONS}
              isRequired
            />
          </div>
          <TextAreaField
            labelName="Description"
            placeholderText="Enter Product Description"
            name="description"
            control={control}
            trigger={trigger}
            isRequired
          />
          <SourceUrls />
          <SingleMediaInput
            name="media"
            label="Media"
            control={control}
            maxFileSize={5 * 1024 * 1024} // 5MB
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
          />
          <SubmitButton submitTitle="Save" isPending={isCreating} />
        </form>
      </FormProvider>
    </section>
  );
}
