"use client";

import { useEffect } from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import { fieldBox, fieldBoxError, fieldError, fieldLabel, requiredMark } from "../formStyles";

export interface IFileInputField<T extends FieldValues> {
  labelName: string;
  name: Path<T>;
  control: Control<T>;
  isRequired?: boolean;
  requiredMessage?: string;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
}

export default function FileInputField<T extends FieldValues>({
  labelName,
  name,
  control,
  isRequired,
  requiredMessage = "This field is required.",
  acceptedFileTypes = ".pdf,.doc,.docx",
  maxFileSizeMB = 5,
}: IFileInputField<T>) {
  const {
    field: { onChange, ref, name: fieldName, value },
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    rules: {
      required: isRequired ? requiredMessage : false,
      validate: (val: File | undefined) => {
        if (!val || !(val instanceof File)) return true;
        const fileSizeMB = val.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) return `Max file size is ${maxFileSizeMB}MB`;
        return true;
      },
    },
  });

  // This Effect fixes the "File Name still showing after reset" bug
  useEffect(() => {
    if (!value) {
      const inputElement = document.getElementById(fieldName) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = ""; // Manually clear the native browser input
      }
    }
  }, [value, fieldName]);

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={fieldName} className={fieldLabel}>
        {labelName}
        {isRequired && <span className={requiredMark}>*</span>}
      </label>

      <div className={cn(
        fieldBox,
        "relative px-1.5",
        error && fieldBoxError
      )}>
        <input
          type="file"
          id={fieldName}
          ref={ref}
          accept={acceptedFileTypes}
          onChange={(e) => {
            const file = e.target.files?.[0];
            onChange(file);
          }}
          className={cn(
            "block w-full text-sm text-neutralPrimary-600 cursor-pointer focus:outline-none",
            "file:mr-3 file:h-8 file:px-4 file:cursor-pointer",
            "file:rounded-md file:border-0",
            "file:text-sm file:font-semibold",
            "file:bg-greenPrimary-500 file:text-white",
            "hover:file:bg-greenPrimary-600 file:transition-colors"
          )}
        />
      </div>
      <p className="text-xs text-neutralPrimary-500 pl-0.5">
        Accepted formats: {acceptedFileTypes.toUpperCase().replace(/\./g, "")} (Max {maxFileSizeMB}MB)
      </p>
      {error && (
        <p className={fieldError}>
          {error.message}
        </p>
      )}
    </div>
  );
}