"use client";

import ForgotPasswordModal from "@/modules/auth/public/forgot-password/ForgotPasswordModal";
import CancelButton from "@/components/primitives/button/CancelButton";
import PasswordField from "@/components/form/PasswordField";
import SubmitButton from "@/components/form/SubmitButton";
import { usePost } from "@/hooks/api/usePost";
import {
  UpdatePasswordFormData,
  updatePasswordFormSchema,
} from "@/modules/user/schemas/profile.schema";
import { logout } from "@/modules/auth/services/auth.service";
import { CategoryCreateResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface IChangePassword {
  userId: number;
  //* ==== THE SIGNED-IN USER'S OWN ADDRESS, USED ONLY BY THE "FORGOT PASSWORD?"
  //* ESCAPE HATCH. WHEN IT IS MISSING THE LINK IS HIDDEN RATHER THAN ASKING
  //* FOR AN ADDRESS WE ALREADY HAVE. ====
  email?: string;
  onClose: () => void;
}

export default function ChangePassword({
  userId,
  email,
  onClose,
}: IChangePassword) {
  //* ==== CHANGING THE PASSWORD REQUIRES THE CURRENT ONE. SOMEONE WHO NO
  //* LONGER KNOWS IT CANNOT GET THROUGH THIS FORM AT ALL, SO THE EMAILED-OTP
  //* RESET IS OFFERED AS THE WAY BACK IN. ====
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { control, trigger, handleSubmit, reset } =
    useForm<UpdatePasswordFormData>({
      resolver: zodResolver(updatePasswordFormSchema),
      defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
    });

  const { mutate: changePassword, isPending } = usePost(
    `/users/change-password/${userId}`,
    (data: CategoryCreateResponse) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        reset();
        onClose();
      }
    },
  );

  const onSubmit: SubmitHandler<UpdatePasswordFormData> = (data) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  //* ==== THE PASSWORD THAT OPENED THIS SESSION IS NO LONGER THE ONE ON THE
  //* ACCOUNT, SO THE SESSION GOES WITH IT AND THE USER SIGNS BACK IN. ====
  const handleResetSuccess = () => {
    setShowForgotPassword(false);
    onClose();
    logout("/login");
  };

  return (
    <section className="p-6 flex flex-col gap-6">
      <p className="text-2xl font-semibold text-neutralPrimary-800">
        Change Password
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <PasswordField
            labelName="Current Password"
            name="currentPassword"
            placeholderText="Enter current password"
            control={control}
            trigger={trigger}
            isRequired
          />
          {email && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="self-end text-sm font-semibold text-greenPrimary-500 hover:text-greenPrimary-600 cursor-pointer"
            >
              Forgot password?
            </button>
          )}
        </div>

        <PasswordField
          labelName="New Password"
          name="newPassword"
          placeholderText="Enter new password"
          control={control}
          trigger={trigger}
          isRequired
        />

        <div className="pt-2">
          <PasswordField
            labelName="Confirm New Password"
            name="confirmNewPassword"
            placeholderText="Re-enter new password"
            control={control}
            trigger={trigger}
            isRequired
          />
        </div>

        <div className="flex items-end justify-end gap-4 pt-4">
          <CancelButton onClick={onClose} />
          <SubmitButton
            submitTitle="Change Password"
            isPending={isPending}
            buttonWidth="w-fit"
          />
        </div>
      </form>

      {showForgotPassword && email && (
        <ForgotPasswordModal
          email={email}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleResetSuccess}
        />
      )}
    </section>
  );
}
