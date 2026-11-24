"use client";
import React from "react";
import PhoneInput, { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FieldValues, Path, PathValue, useController } from "react-hook-form";
import { IPhoneInputField } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  fieldBox,
  fieldBoxError,
  fieldError,
  fieldInput,
  fieldLabel,
  requiredMark,
} from "./formStyles";

export default function PhoneInputField<T extends FieldValues>({
  name,
  control,
  label = "Phone Number",
  isRequired = false,
  requiredMessage = "Phone number is required",
  disabled = false,
  isLoading = false,
  inlineError = false,
}: IPhoneInputField<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
    defaultValue: "" as PathValue<T, Path<T>>,
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 w-full relative">
        <div>
          {label && (
            <label className={fieldLabel}>
              {label}
              {isRequired && !disabled && (
                <span className={requiredMark}>*</span>
              )}
            </label>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-11 w-full rounded-lg" />
        ) : (
          <div className={cn(fieldBox, error && !disabled && fieldBoxError)}>
            <PhoneInput
              international
              defaultCountry="BD"
              value={value as Value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              ref={ref}
              className={`${fieldInput} phone-field`}
            />
          </div>
        )}
        {error && !disabled && (
          <p
            className={
              inlineError
                ? fieldError
                : `${fieldError} absolute bottom-[-24px] left-0`
            }
          >
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
