"use client";

import React from "react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { LogIn, UserCheck } from "lucide-react";
import InputField from "@/components/form/InputField";
import PhoneInputField from "@/components/form/PhoneInputField";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import CheckoutSection from "./CheckoutSection";

export default function PersonalInformation() {
  const { control, trigger } = useFormContext();
  const { userId, currentUserData, isCurrentUserLoading } = useCurrentUser();

  return (
    <CheckoutSection
      id="checkout-contact"
      step={1}
      title="Contact information"
      description="The courier calls this number on delivery day."
      aside={
        userId ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-greenPrimary-950 px-3 py-1 text-xs font-semibold text-greenPrimary-700">
            <UserCheck size={14} />
            Signed in{currentUserData?.firstName ? ` as ${currentUserData.firstName}` : ""}
          </span>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-greenPrimary-300 px-3 py-1 text-xs font-semibold text-greenPrimary-600 transition-colors hover:bg-greenPrimary-950"
          >
            <LogIn size={14} />
            Log in for faster checkout
          </Link>
        )
      }
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <InputField
          labelName="First Name"
          placeholderText="e.g. Samiha"
          name="firstName"
          control={control}
          trigger={trigger}
          isRequired
          isLoading={isCurrentUserLoading}
        />
        <InputField
          labelName="Last Name"
          placeholderText="e.g. Quazi"
          name="lastName"
          control={control}
          trigger={trigger}
          isLoading={isCurrentUserLoading}
        />
        <PhoneInputField name="phone" control={control} isRequired />
        <InputField
          labelName="Email (optional)"
          placeholderText="For your order confirmation"
          name="userEmail"
          control={control}
          trigger={trigger}
          isLoading={isCurrentUserLoading}
        />
      </div>
      {!userId && (
        <p className="mt-4 text-xs text-neutralPrimary-500">
          No account needed. You can check out as a guest.
        </p>
      )}
    </CheckoutSection>
  );
}
