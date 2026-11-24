"use client";

import { IInputField } from "@/types";
import { FieldValues, Path, PathValue, useController } from "react-hook-form";
import InputFieldSkeleton from "./InputFieldSkeleton";
import { cn } from "@/lib/utils";
import {
  fieldBox,
  fieldBoxError,
  fieldError,
  fieldIcon,
  fieldInput,
  fieldLabel,
  requiredMark,
} from "./formStyles";

export default function InputField<
  T extends FieldValues,
  Type extends "text" | "number" | "email"
>({
  labelName,
  inputType = "text" as Type,
  IconComponent,
  placeholderText,
  name,
  control,
  trigger,
  disabled,
  isRequired,
  defaultValue,
  isLoading = false,
  requiredMessage = "This field is required.",
  autoFocus = false,
  onKeyDown,
  onPaste,
  inputRef,
  inlineError = false,
}: IInputField<T, Type>) {
  const { field, fieldState } = useController<T>({
    name,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
    defaultValue: defaultValue as PathValue<T, Path<T>>,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputType === "number") {
      const raw = e.target.value;
      const next = raw === "" ? null : Number(raw);
      // const next = raw === "" ? undefined : Number(raw);
      field.onChange(next);
    } else {
      field.onChange(e.target.value);
    }
    trigger?.(field.name);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 w-full relative">
        {/* The label is a direct flex child, like in SingleSelectSearch and
            TextEditor. A wrapping <div> gave it the 24px line box of the
            parent's 16px text instead of its own 20px, so an input sat 4px
            lower than a select placed beside it. */}
        <label className={fieldLabel}>
          {labelName}
          {isRequired && !disabled && (
            <span className={requiredMark}>*</span>
          )}
        </label>
        {isLoading ? (
          <InputFieldSkeleton />
        ) : (
          <div
            className={cn(
              fieldBox,
              fieldState.error && !disabled && fieldBoxError
            )}
          >
            {IconComponent && <IconComponent className={fieldIcon} />}
            <input
              ref={inputRef}
              className={`${fieldInput} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              type={inputType}
              placeholder={placeholderText}
              value={field.value ?? ""}
              onChange={handleChange}
              name={field.name}
              disabled={disabled}
              onWheel={(e) => e.currentTarget.blur()}
              autoFocus={autoFocus}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
            />
          </div>
        )}
        {fieldState.error && !disabled && (
          <p
            className={
              inlineError
                ? fieldError
                : `${fieldError} absolute bottom-[-24px] left-0`
            }
          >
            {fieldState.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
