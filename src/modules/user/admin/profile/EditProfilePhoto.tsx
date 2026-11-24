"use client";

import CancelButton from "@/components/primitives/button/CancelButton";
import SubmitButton from "@/components/form/SubmitButton";
import ProfileAvatar from "@/components/primitives/ProfileAvatar";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import { IUser } from "@/modules/user/types/user.types";
import { Trash2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IEditProfilePhoto {
  user: IUser;
  onClose: () => void;
  refetch?: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB — matches the server upload limit

export default function EditProfilePhoto({
  user,
  onClose,
  refetch,
}: IEditProfilePhoto) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    user?.profileImageUrl ?? undefined,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const name = user?.name || user?.email;

  //* ==== RELEASE THE OBJECT URL CREATED FOR THE LOCAL PREVIEW ====
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { mutate: updatePhoto, isPending } = useFormPatch<IUser>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        refetch?.();
        onClose();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setRemovePhoto(false);
  };

  const handleRemove = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(undefined);
    setRemovePhoto(true);
  };

  const handleSubmit = () => {
    if (!file && !removePhoto) {
      toast.info("No changes detected!");
      onClose();
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("profileImage", file);
    } else if (removePhoto) {
      formData.append("removeProfileImage", "true");
    }

    updatePhoto({
      endpoint: `/users/${user.id}`,
      data: formData,
    });
  };

  return (
    <section className="p-6 flex flex-col gap-6">
      <p className="text-2xl font-semibold text-neutralPrimary-800">
        Change Profile Photo
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-4">
          <ProfileAvatar
            src={previewUrl}
            name={name}
            sizeClass="w-32 h-32"
            fallbackTextClass="text-3xl"
            bordered
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 text-sm font-semibold text-greenPrimary-600 border border-greenPrimary-200 rounded-lg px-4 py-2 hover:bg-greenPrimary-950 cursor-pointer transition-colors duration-200"
            >
              <Upload className="w-4 h-4" />
              Choose Photo
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 text-sm font-semibold text-destructive-600 border border-destructive-200 rounded-lg px-4 py-2 hover:bg-destructive-50 cursor-pointer transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-neutralPrimary-400">
            JPG, PNG or WEBP. Max 2MB.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </div>

        <div className="flex items-end justify-end gap-4 pt-2">
          <CancelButton onClick={onClose} />
          <SubmitButton
            submitTitle="Save Photo"
            isPending={isPending}
            buttonWidth="w-fit"
          />
        </div>
      </form>
    </section>
  );
}
