"use client";

import React, { useRef, useState } from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldError, fieldLabel, requiredMark } from "@/components/form/formStyles";
import { RESUME_ACCEPT, RESUME_MAX_MB } from "../../constants/career.constants";
import { formatFileSize } from "../../utils/career.utils";

interface IResumeUploadField<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
}

/**
 * Drop zone for the resume: click or drag a file in, see its name and size,
 * remove it to pick another. Type and size are checked by the form schema.
 */
export default function ResumeUploadField<T extends FieldValues>({
  name,
  control,
  label = "Resume / CV",
}: IResumeUploadField<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control });

  const picked: unknown = value;
  const file = picked instanceof File ? picked : undefined;
  const inputId = `${String(name)}-input`;
  const hintId = `${String(name)}-hint`;

  const pick = (picked?: File) => {
    onChange(picked);
    onBlur();
  };

  const clear = () => {
    pick(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pick(dropped);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className={fieldLabel}>
        {label}
        <span className={requiredMark}>*</span>
      </span>

      {file ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white p-3 sm:p-4",
            error ? "border-destructive-500" : "border-greenPrimary-300",
          )}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutralPrimary-800">
              {file.name}
            </p>
            <p className="text-xs text-neutralPrimary-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-greenPrimary-600 hover:underline cursor-pointer max-sm:hidden"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label="Remove file"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutralPrimary-500 hover:bg-destructive-50 hover:text-destructive-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors focus-within:ring-4 focus-within:ring-greenPrimary-500/20",
            isDragging
              ? "border-greenPrimary-500 bg-greenPrimary-950"
              : error
                ? "border-destructive-400 bg-destructive-50/40"
                : "border-neutralPrimary-300 bg-neutralPrimary-50 hover:border-greenPrimary-400 hover:bg-greenPrimary-950/50",
          )}
        >
          <UploadCloud className="h-8 w-8 text-greenPrimary-500" aria-hidden />
          <span className="text-sm text-neutralPrimary-700">
            <span className="font-semibold text-greenPrimary-600">Click to upload</span>{" "}
            <span className="max-sm:hidden">or drag and drop</span>
          </span>
          <span id={hintId} className="text-xs text-neutralPrimary-500">
            PDF, DOC or DOCX · up to {RESUME_MAX_MB} MB
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={RESUME_ACCEPT}
        aria-describedby={hintId}
        aria-invalid={Boolean(error)}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {error?.message && (
        <p className={fieldError} role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
