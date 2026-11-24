"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType } from "@/types";
import PasswordField from "@/components/form/PasswordField";
import SubmitButton from "@/components/form/SubmitButton";
import { z } from "zod";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  email: string;
  otp: string; // Add OTP prop
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResetPasswordForm({
  email,
  otp,
  onSuccess,
  onCancel,
}: ResetPasswordFormProps) {
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: resetPassword, isPending } = usePost(
    "/users/reset-password",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess();
      }
    }
  );

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPassword({
      email,
      otp,
      newPassword: data.newPassword,
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Set New Password
      </h2>
      <p className="text-gray-600 mb-6">
        Create a new password for your account
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          labelName="New Password"
          placeholderText="Enter new password"
          name="newPassword"
          control={control}
          isRequired
        />
        
        <PasswordField
          labelName="Confirm Password"
          placeholderText="Confirm new password"
          name="confirmPassword"
          control={control}
          isRequired
        />
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isPending}
          >
            Cancel
          </button>
          <SubmitButton
            submitTitle={isPending ? "Updating..." : "Update Password"}
            isPending={isPending}
          />
        </div>
      </form>
    </>
  );
}