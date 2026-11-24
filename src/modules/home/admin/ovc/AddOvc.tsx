"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { Clapperboard, Film, ImageIcon, Link2, Sparkles } from "lucide-react";
import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import { useFormPost } from "@/hooks/api/useFormPost";
import { OvcFormData, ovcSchema } from "@/modules/home/schemas/ovc.schema";
import { IModal } from "@/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  FormActions,
  FormDivider,
  FormSection,
  HOME_FORM_WRAPPER,
} from "../home-form.parts";

type MediaKind = "VIDEO_FILE" | "VIDEO_LINK" | "GIF" | "IMAGE";

/**
 * An OVC holds exactly one media item, so the form shows one input at a time
 * instead of stacking all four (which meant a lot of scrolling and let the
 * admin fill in two, which the server rejects).
 */
const MEDIA_KINDS: {
  kind: MediaKind;
  label: string;
  hint: string;
  icon: typeof Film;
}[] = [
  { kind: "VIDEO_FILE", label: "Video file", hint: "MP4, MOV or AVI, up to 150 MB", icon: Film },
  { kind: "VIDEO_LINK", label: "Video link", hint: "A YouTube or other hosted video", icon: Link2 },
  { kind: "GIF", label: "GIF", hint: "Animated GIF, up to 10 MB", icon: Sparkles },
  { kind: "IMAGE", label: "Image", hint: "JPEG, PNG or WebP, up to 5 MB", icon: ImageIcon },
];

export default function AddOvc({ setOpen, refetch }: IModal) {
  const [mediaKind, setMediaKind] = useState<MediaKind>("VIDEO_FILE");

  const methods = useForm<OvcFormData>({
    resolver: zodResolver(ovcSchema) as Resolver<OvcFormData>,
    defaultValues: {
      videoFile: null,
      gifFile: null,
      imageFile: null,
      videoUrl: "",
      redirectUrl: "",
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isSubmitted },
  } = methods;

  // * Switching kind clears the other media, so only one can ever be sent.
  const chooseKind = (kind: MediaKind) => {
    if (kind === mediaKind) return;
    if (kind !== "VIDEO_FILE") setValue("videoFile", null);
    if (kind !== "GIF") setValue("gifFile", null);
    if (kind !== "IMAGE") setValue("imageFile", null);
    if (kind !== "VIDEO_LINK") setValue("videoUrl", "");
    clearErrors(["videoFile", "gifFile", "imageFile", "videoUrl"]);
    setMediaKind(kind);
  };

  const { mutate: addOvc, isPending } = useFormPost(
    "/home-content/create-home-content",
    (data: unknown) => {
      const response = data as { statusCode: number };
      if (response.statusCode >= 200 && response.statusCode < 300) {
        reset();
        refetch?.();
        setOpen?.(false);
      }
    },
  );

  const onSubmit = (data: OvcFormData) => {
    const formData = new FormData();
    formData.append("type", "OVC");

    // Append based on what was actually selected
    if (data.videoFile instanceof File) {
      formData.append("videoFile", data.videoFile);
    } else if (data.gifFile instanceof File) {
      formData.append("gifFile", data.gifFile);
    } else if (data.imageFile instanceof File) {
      formData.append("imageFile", data.imageFile);
    } else if (data.videoUrl && data.videoUrl.trim() !== "") {
      formData.append("videoUrl", data.videoUrl);
    }
    if (data.redirectUrl && data.redirectUrl.trim() !== "") {
      formData.append("redirectUrl", data.redirectUrl);
    }

    addOvc(formData as unknown as Record<string, unknown>);
  };

  // * The schema reports "no media" on videoFile; show it by the picker when
  // * that input isn't the one on screen.
  const mediaError =
    isSubmitted && mediaKind !== "VIDEO_FILE" ? errors.videoFile?.message : undefined;
  const activeKind = MEDIA_KINDS.find((m) => m.kind === mediaKind)!;

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Clapperboard}
        eyebrow="OVC"
        title="Add Video Commercial"
        description="Upload one video, GIF or image, or paste a video link."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ MEDIA ============ */}
        <FormSection
          title="Media"
          description="Choose what the commercial shows. Only one kind can be used."
        >
          {/* Segmented picker: 2 × 2 on phones, one row from tablets up. */}
          <div
            role="radiogroup"
            aria-label="Media type"
            className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {MEDIA_KINDS.map(({ kind, label, icon: Icon }) => {
              const active = kind === mediaKind;
              return (
                <button
                  key={kind}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseKind(kind)}
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                    "focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20 focus-visible:outline-none cursor-pointer",
                    active
                      ? "border-greenPrimary-500 bg-greenPrimary-500/10 text-greenPrimary-700"
                      : "border-neutralPrimary-300 bg-white text-neutralPrimary-600 hover:border-neutralPrimary-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="-mt-1 text-xs text-neutralPrimary-500">{activeKind.hint}</p>
          {mediaError && (
            <p className="text-xs font-medium text-destructive-500">{mediaError}</p>
          )}

          {/* * Only the chosen input is rendered. */}
          {mediaKind === "VIDEO_FILE" && (
            <SingleMediaInput
              name="videoFile"
              label="Video file"
              control={control}
              maxFileSize={150 * 1024 * 1024} // 150MB, the server limit
              acceptedFileTypes={["video/*"]}
              isRequired
            />
          )}
          {mediaKind === "VIDEO_LINK" && (
            <InputField
              labelName="Video link"
              name="videoUrl"
              placeholderText="https://www.youtube.com/watch?v=..."
              control={control}
              trigger={trigger}
              isRequired
            />
          )}
          {mediaKind === "GIF" && (
            <SingleMediaInput
              name="gifFile"
              label="GIF"
              control={control}
              maxFileSize={10 * 1024 * 1024} // 10MB, the server limit
              acceptedFileTypes={["image/gif"]}
              isRequired
            />
          )}
          {mediaKind === "IMAGE" && (
            <SingleMediaInput
              name="imageFile"
              label="Image"
              control={control}
              maxFileSize={5 * 1024 * 1024} // 5MB, the server limit
              acceptedFileTypes={["image/*"]}
              isRequired
            />
          )}
        </FormSection>

        <FormDivider />

        {/* ============ LINK ============ */}
        <FormSection
          title="Link"
          description="Where a click on the commercial leads. Leave empty if it shouldn't be clickable."
        >
          <InputField
            labelName="Link"
            name="redirectUrl"
            placeholderText="https://naturacarebd.com/shop"
            control={control}
            trigger={trigger}
          />
        </FormSection>

        {/* ============ ACTIONS (PINNED) ============ */}
        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Add OVC"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
