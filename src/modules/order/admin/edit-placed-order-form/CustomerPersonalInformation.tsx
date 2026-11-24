"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import InputField from "@/components/form/InputField";
import PhoneInputField from "@/components/form/PhoneInputField";

interface IProps {
  isLoading: boolean;
}
export default function CustomerPersonalInformation({ isLoading }: IProps) {
  const { control, trigger } = useFormContext();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <InputField
        labelName="First Name"
        placeholderText="First name"
        name="firstName"
        control={control}
        trigger={trigger}
        isRequired
        isLoading={isLoading}
      />
      <InputField
        labelName="Last Name"
        placeholderText="Last name"
        name="lastName"
        control={control}
        trigger={trigger}
        isLoading={isLoading}
      />
      <PhoneInputField name="phone" control={control} isRequired />
      <InputField
        labelName="Email"
        placeholderText="customer@example.com"
        name="userEmail"
        control={control}
        trigger={trigger}
        isLoading={isLoading}
      />
    </div>
  );
}
