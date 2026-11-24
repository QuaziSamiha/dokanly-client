"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { ExternalLink, Lock, Share2 } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { fieldBox, fieldLabel } from "@/components/form/formStyles";
import { homeContentStatus } from "@/modules/home/constants/home-admin.constants";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  PlatformRedirectFormData,
  platformRedirectSchema,
} from "@/modules/home/schemas/platform-redirect.schema";
import { IModal } from "@/types";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
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
import { PLATFORMS } from "./platform-redirect.columns";

const resolver = inactiveAwareResolver<PlatformRedirectFormData>(
  platformRedirectSchema,
);

const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};

/** A value that is shown like a field but cannot be changed. */
const ReadOnlyField = ({
  label,
  icon,
  value,
  lockedReason,
}: {
  label: string;
  icon?: React.ReactNode;
  value?: string | null;
  lockedReason: string;
}) => (
  <div className="flex w-full flex-col gap-2">
    <span className={fieldLabel}>{label}</span>
    <div
      className={`${fieldBox} cursor-not-allowed bg-neutralPrimary-100 hover:border-neutralPrimary-300`}
      title={lockedReason}
      aria-readonly="true"
    >
      {icon}
      <span
        className={`flex-1 truncate text-sm ${value ? "text-neutralPrimary-700" : "text-neutralPrimary-400"}`}
      >
        {value || "Not set"}
      </span>
      <Lock className="h-4 w-4 shrink-0 text-neutralPrimary-400" />
    </div>
  </div>
);

export default function EditPlatformRedirect({
  setOpen,
  refetch,
  data,
  isLoading,
}: IModal) {
  const rowData = data as IHomeContent;
  const platform = rowData?.platformType ? PLATFORMS[rowData.platformType] : null;
  const platformName = rowData?.platformName || platform?.label || "";

  const methods = useForm<PlatformRedirectFormData>({
    resolver,
    defaultValues: {
      url: rowData?.redirectUrl ?? "",
      media: rowData?.image,
      status: rowData?.status,
      order: rowData?.sortOrder ?? undefined,
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    resetField,
    formState: { isDirty, dirtyFields },
  } = methods;

  const [status, previewUrl, previewMedia] = useWatch({
    control,
    name: ["status", "url", "media"],
  });

  // * ============ INACTIVE LOCK ==============
  // * An inactive platform is hidden from the home page, so only its status can
  // * change. Switching to Inactive discards unsaved edits to the other fields,
  // * so they are neither saved nor left failing validation while locked.
  const isInactive = status === "INACTIVE";
  useEffect(() => {
    if (isInactive) {
      resetField("url");
      resetField("order");
      resetField("media");
    }
  }, [isInactive, resetField]);

  // * ============ LIVE PREVIEW ==============
  // * A newly picked file has no URL yet: preview it from memory.
  const iconSrc = useMemo(
    () =>
      previewMedia instanceof File
        ? URL.createObjectURL(previewMedia)
        : previewMedia || "",
    [previewMedia],
  );
  useEffect(
    () => () => {
      if (iconSrc.startsWith("blob:")) URL.revokeObjectURL(iconSrc);
    },
    [iconSrc],
  );

  const previewHost = hostOf(previewUrl);

  const { mutate: updateData, isPending } = useFormPatch<IHomeContent>(
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

  const onSubmit = (data: PlatformRedirectFormData) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    // * Only changed fields are sent; the server leaves the rest as they are.
    // * While inactive only the status can have changed (see INACTIVE LOCK).
    const formData = new FormData();
    formData.append("type", rowData?.type);
    if (dirtyFields.status && data.status) {
      formData.append("status", data.status);
    }
    if (!isInactive) {
      if (dirtyFields.url) {
        formData.append("redirectUrl", data.url);
      }
      if (dirtyFields.order && data.order !== undefined) {
        formData.append("sortOrder", data.order.toString());
      }
      if (dirtyFields.media && data.media instanceof File) {
        formData.append("imageFile", data.media);
      }
    }

    updateData({
      endpoint: `/home-content/update/${rowData.id}`,
      data: formData,
    });
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Share2}
        eyebrow="Platform Redirect"
        title="Edit Platform Redirect"
        description="Update the link, position, icon or visibility of this social platform."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ PREVIEW ============ */}
        {/* What the visitor sees and where a click takes them, updated as you edit. */}
        <div className="flex w-full items-center gap-4 rounded-xl border border-neutralPrimary-200 bg-gradient-to-r from-neutralPrimary-50 to-white p-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutralPrimary-200 bg-white shadow-sm">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={`${platformName || "Platform"} icon`}
                fill
                sizes="56px"
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              <Share2 className="h-6 w-6 text-neutralPrimary-300" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-neutralPrimary-400 uppercase">
              Preview{isInactive ? " · hidden from the home page" : ""}
            </p>
            <p className="truncate text-sm font-semibold text-neutralPrimary-800">
              {platformName || "Platform name"}
            </p>
            <p className="truncate text-xs text-neutralPrimary-500">
              {previewHost || "No valid link yet"}
            </p>
          </div>
          {previewHost && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutralPrimary-300 bg-white px-3 py-2 text-xs font-medium text-neutralPrimary-600 transition-colors hover:border-greenPrimary-400 hover:text-greenPrimary-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Test link
            </a>
          )}
        </div>

        {/* ============ PLATFORM (READ-ONLY) ============ */}
        <FormSection
          title="Platform"
          description="Set when the platform was added and cannot be changed."
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <ReadOnlyField
              label="Platform name"
              value={platformName}
              lockedReason="The platform name cannot be changed"
            />
            <ReadOnlyField
              label="Platform type"
              value={platform?.label}
              icon={
                platform ? (
                  <platform.icon
                    className={`h-4 w-4 shrink-0 ${platform.badge.split(" ")[0]}`}
                  />
                ) : null
              }
              lockedReason="The platform type cannot be changed"
            />
          </div>
        </FormSection>

        <FormDivider />

        {/* ============ VISIBILITY ============ */}
        {/* Comes before the fields it unlocks. */}
        <FormSection
          title="Visibility"
          description="Only active platforms appear on the home page (up to 4)."
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
            <InactiveLockNotice
              item="platform"
              fields="link, position and icon"
            />
          )}
        </FormSection>

        <LockableFieldset locked={isInactive}>
          <FormDivider />

          {/* ============ LINK & POSITION ============ */}
          <FormSection
            title="Link and position"
            description="Where a click on the icon leads, and its place among the platforms (1 comes first; others shift to make room)."
          >
            <div className="grid w-full gap-4 sm:grid-cols-[1fr_180px]">
              <InputField
                labelName="Link"
                name="url"
                placeholderText="https://www.facebook.com/naturacarebd"
                control={control}
                trigger={trigger}
                isRequired={!isInactive}
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

          <FormDivider />

          {/* ============ ICON (LAST) ============ */}
          <FormSection
            title="Icon"
            description="A square logo works best (at least 128 × 128 px). JPEG, PNG or WebP, up to 5 MB. Uploading a new icon replaces the current one."
          >
            <SingleMediaInput
              name="media"
              label="Platform icon"
              control={control}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={["image/*"]} // Only images
              isRequired={!isInactive}
            />
          </FormSection>
        </LockableFieldset>

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
