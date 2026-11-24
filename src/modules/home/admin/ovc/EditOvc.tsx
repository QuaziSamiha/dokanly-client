"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { Clapperboard, Film, ImageIcon, Link2, Sparkles } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { homeContentStatus } from "@/modules/home/constants/home-admin.constants";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  OvcEditFormData,
  ovcEditSchema,
} from "@/modules/home/schemas/ovc.schema";
import { IModal } from "@/types";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import { getEmbedUrl } from "@/lib/utils/url.utils";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  AuditMeta,
  FormActions,
  FormDivider,
  FormSection,
  HOME_FORM_WRAPPER,
  InactiveLockNotice,
  LockableFieldset,
  inactiveAwareResolver,
} from "../home-form.parts";

const resolver = inactiveAwareResolver<OvcEditFormData>(ovcEditSchema);

type OvcMedia = "VIDEO_FILE" | "VIDEO_LINK" | "GIF" | "IMAGE";

const OVC_MEDIA: Record<OvcMedia, { label: string; icon: typeof Film }> = {
  VIDEO_FILE: { label: "Uploaded video", icon: Film },
  VIDEO_LINK: { label: "Video link", icon: Link2 },
  GIF: { label: "Animated GIF", icon: Sparkles },
  IMAGE: { label: "Image", icon: ImageIcon },
};

/** An uploaded video keeps its original file name in `title`; a pasted link has none. */
const mediaOf = (item?: IHomeContent): OvcMedia | null => {
  if (item?.image) return /\.gif(\?|$)/i.test(item.image) ? "GIF" : "IMAGE";
  if (item?.videoUrl) return item.title ? "VIDEO_FILE" : "VIDEO_LINK";
  return null;
};

export default function EditOvc({
  data,
  isLoading,
  setOpen,
  refetch,
}: IModal) {
  const rowData = data as IHomeContent;
  const media = mediaOf(rowData);
  const mediaInfo = media ? OVC_MEDIA[media] : null;

  const {
    control,
    trigger,
    handleSubmit,
    resetField,
    formState: { isDirty, dirtyFields },
  } = useForm<OvcEditFormData>({
    resolver,
    defaultValues: {
      redirectUrl: rowData?.redirectUrl ?? "",
      status: rowData?.status,
      order: rowData?.sortOrder ?? undefined,
    },
  });

  // * ============ INACTIVE LOCK ==============
  // * Switching to Inactive discards unsaved edits to the other fields.
  const status = useWatch({ control, name: "status" });
  const isInactive = status === "INACTIVE";
  useEffect(() => {
    if (isInactive) {
      resetField("redirectUrl");
      resetField("order");
    }
  }, [isInactive, resetField]);

  // ============= API HOOK ==============
  const { mutate: updateOvc, isPending } = useFormPatch<IHomeContent>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const onSubmit = (data: OvcEditFormData) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    // * Only changed fields are sent; while inactive, only the status.
    const formData = new FormData();
    formData.append("type", rowData?.type);
    if (dirtyFields.status && data.status) {
      formData.append("status", data.status);
    }
    if (!isInactive) {
      // * An empty link is sent as "" so the server removes it.
      if (dirtyFields.redirectUrl) {
        formData.append("redirectUrl", data.redirectUrl);
      }
      if (dirtyFields.order && data.order !== undefined) {
        formData.append("sortOrder", data.order.toString());
      }
    }

    updateOvc({
      endpoint: `/home-content/update/${rowData.id}`,
      data: formData,
    });
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Clapperboard}
        eyebrow="OVC"
        title="Edit Video Commercial"
        description="Change the link, position or visibility. To swap the media, delete this OVC and add a new one."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ VISIBILITY ============ */}
        {/* First, because it decides whether the rest can be edited. */}
        <FormSection
          title="Visibility"
          description="The home page shows one active OVC: the first by position."
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <SingleSelectSearch
              labelName="Status"
              name="status"
              control={control}
              options={homeContentStatus}
              isLoading={isLoading}
            />
          </div>
          {isInactive && (
            <InactiveLockNotice item="OVC" fields="link and position" />
          )}
        </FormSection>

        <LockableFieldset locked={isInactive}>
          <FormDivider />

          {/* ============ LINK & POSITION ============ */}
          <FormSection
            title="Link and position"
            description="Where a click on the commercial leads (leave empty for none), and its place among the OVCs: 1 comes first."
          >
            <div className="grid w-full gap-4 sm:grid-cols-[1fr_180px]">
              <InputField
                labelName="Link"
                name="redirectUrl"
                placeholderText="https://naturacarebd.com/shop"
                control={control}
                trigger={trigger}
                isLoading={isLoading}
              />
              <InputField
                labelName="Position"
                name="order"
                inputType="number"
                placeholderText="e.g. 1"
                control={control}
                trigger={trigger}
                isLoading={isLoading}
              />
            </div>
          </FormSection>
        </LockableFieldset>

        <FormDivider />

        {/* ============ MEDIA (LAST, READ-ONLY) ============ */}
        {/* Outside the lock so the commercial can always be previewed. */}
        <FormSection
          title="Media"
          description="Shown for reference. The media can't be replaced: delete this OVC and add a new one to change it."
        >
          {mediaInfo && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-neutralPrimary-100 px-2.5 py-1 text-xs font-medium text-neutralPrimary-600 ring-1 ring-neutralPrimary-200 ring-inset">
              <mediaInfo.icon className="h-3.5 w-3.5" />
              {mediaInfo.label}
              {media === "VIDEO_FILE" && rowData.title && (
                <span
                  className="max-w-[220px] truncate text-neutralPrimary-400"
                  title={rowData.title}
                >
                  · {rowData.title}
                </span>
              )}
            </span>
          )}

          {/* * One frame for every media kind: never taller than ~320px. */}
          <div className="relative flex aspect-video max-h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-900 sm:max-h-80">
            {(media === "IMAGE" || media === "GIF") && rowData.image && (
              <Image
                src={rowData.image}
                alt="OVC media"
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-contain"
                unoptimized={media === "GIF"}
              />
            )}
            {media === "VIDEO_FILE" && (
              <video
                controls
                preload="metadata"
                className="h-full w-full object-contain"
              >
                <source src={rowData.videoUrl} type="video/mp4" />
              </video>
            )}
            {media === "VIDEO_LINK" && rowData.videoUrl && (
              <iframe
                src={getEmbedUrl(rowData.videoUrl)}
                title="OVC video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {!media && (
              <span className="text-sm text-neutralPrimary-400">No media</span>
            )}
          </div>
        </FormSection>

        <AuditMeta item={rowData} />

        {/* ============ ACTIONS (PINNED) ============ */}
        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Save changes"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
