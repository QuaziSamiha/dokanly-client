"use client";

import CancelButton from "@/components/primitives/button/CancelButton";
import InputField from "@/components/form/InputField";
import PhoneInputField from "@/components/form/PhoneInputField";
import SubmitButton from "@/components/form/SubmitButton";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  UpdatePersonalInfoFormData,
  updatePersonalInfoSchema,
} from "@/modules/user/schemas/profile.schema";
import { IUser } from "@/modules/user/types/user.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

interface IEditPersonalInfo {
  user: IUser;
  onClose: () => void;
  refetch?: () => void;
}

export default function EditPersonalInfo({
  user,
  onClose,
  refetch,
}: IEditPersonalInfo) {
  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm<UpdatePersonalInfoFormData>({
    resolver: zodResolver(updatePersonalInfoSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    },
  });

  const { mutate: updateProfile, isPending } = useFormPatch<IUser>(
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

  const onSubmit: SubmitHandler<UpdatePersonalInfoFormData> = (data) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      onClose();
      return;
    }

    const formData = new FormData();

    if (dirtyFields.firstName) {
      formData.append("firstName", data.firstName);
    }
    if (dirtyFields.lastName) {
      formData.append("lastName", data.lastName ?? "");
    }
    //* ==== THE API STORES `name` SEPARATELY AND NEVER REBUILDS IT FROM THE
    //* NAME PARTS, SO IT IS SENT ALONG WHENEVER EITHER PART CHANGES —
    //* OTHERWISE THE SIDEBAR/NAVBAR WOULD KEEP SHOWING THE OLD FULL NAME. ====
    if (dirtyFields.firstName || dirtyFields.lastName) {
      formData.append(
        "name",
        [data.firstName, data.lastName].filter(Boolean).join(" ").trim(),
      );
    }
    //* ==== `phone` IS VALIDATED AS UNIQUE ACROSS USERS WITHOUT EXCLUDING THE
    //* CURRENT RECORD, SO RESENDING AN UNCHANGED NUMBER WOULD 400. A CLEARED
    //* FIELD IS OMITTED TOO, SINCE "" FAILS THE PHONE FORMAT CHECK. ====
    if (data.phone && data.phone !== user?.phone) {
      formData.append("phone", data.phone);
    }

    //* ==== NOTHING SURVIVED THE FILTERS ABOVE (E.G. ONLY THE PHONE WAS
    //* TOUCHED AND IT ENDED UP UNCHANGED) ====
    if (Array.from(formData.keys()).length === 0) {
      toast.info("No changes detected!");
      onClose();
      return;
    }

    updateProfile({
      endpoint: `/users/${user.id}`,
      data: formData,
    });
  };

  return (
    <section className="p-6 flex flex-col gap-6">
      <p className="text-2xl font-semibold text-neutralPrimary-800">
        Edit Personal Information
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid max-md:grid-cols-1 grid-cols-2 gap-6">
          <InputField
            labelName="First Name"
            name="firstName"
            placeholderText="Enter your first name"
            control={control}
            trigger={trigger}
            isRequired
          />
          <InputField
            labelName="Last Name"
            name="lastName"
            placeholderText="Enter your last name"
            control={control}
            trigger={trigger}
          />
        </div>

        <PhoneInputField name="phone" control={control} />

        <div className="flex items-end justify-end gap-4 pt-2">
          <CancelButton onClick={onClose} />
          <SubmitButton
            submitTitle="Save Changes"
            isPending={isPending}
            buttonWidth="w-fit"
          />
        </div>
      </form>
    </section>
  );
}
