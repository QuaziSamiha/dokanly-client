"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ITextEditor } from "@/types";
import dynamic from "next/dynamic";
import {
  type FieldValues,
  type Path,
  type PathValue,
  useController,
} from "react-hook-form";
import "react-quill-new/dist/quill.snow.css";
import { fieldError, fieldLabel, requiredMark } from "./formStyles";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <Skeleton className="h-[150px] w-full rounded-md" />,
});

const modules = {
  toolbar: [
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
  ],
};

const formats = ["size", "bold", "underline", "list"];

export function TextEditor<T extends FieldValues>({
  labelName,
  placeholderText,
  name,
  control,
  trigger,
  isRequired,
  disabled,
  defaultValue,
  requiredMessage = "This field is required.",
  isLoading,
  compact = false,
}: ITextEditor<T>) {
  const { field, fieldState } = useController<T>({
    name: name as Path<T>,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
    defaultValue: defaultValue as PathValue<T, Path<T>>,
  });

  // Quill 2 reports an empty editor as "<p></p>", not "". Store "" instead so
  // required/optional checks see it as empty and no empty markup is saved.
  const handleChange = (
    content: string,
    _delta: unknown,
    source: string,
    editor: { getText: () => string },
  ) => {
    // Quill also fires onChange with source "api" when it mounts or when the
    // value prop changes (e.g. a form reset). Those are not edits: acting on
    // them showed "required" errors before the user typed anything and could
    // mark an untouched edit form as dirty.
    if (source !== "user") return;

    field.onChange(editor.getText().trim() === "" ? "" : content);
    if (trigger) {
      trigger(field.name);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-[192px] w-full rounded-lg" />{" "}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className={fieldLabel}>
        {labelName}
        {isRequired && !disabled && (
          <span className={requiredMark}>*</span>
        )}{" "}
      </label>
      <div
        className={`quill-container ${compact ? "quill-container--compact" : ""} ${
          fieldState?.error && !disabled ? "quill-container--error" : ""
        }`}
      >
        <ReactQuill
          theme="snow"
          value={field.value || ""}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholderText}
          className="text-editor w-full"
        />
      </div>
      {fieldState?.error && !disabled && (
        <p className={fieldError}>
          {fieldState?.error?.message}
        </p>
      )}
    </div>
  );
}
