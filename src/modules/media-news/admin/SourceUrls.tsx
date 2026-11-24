"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import InputField from "@/components/form/InputField";
import { MdAdd, MdDelete } from "react-icons/md";

export default function SourceUrls() {
  const { control, trigger } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sourceUrls",
  });

  // Initialize with one empty field if the array is empty
  const addSourceUrl = () => {
    append({
      url: "",
    });
  };

  const removeSourceUrl = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  if (fields.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-end flex-col gap-4">
          <div className="flex gap-4 items-end w-full">
            <div className="flex items-center gap-3 w-full">
              <InputField
                labelName="Source URL"
                name="sourceUrls.0.url"
                placeholderText="Enter Source URL"
                control={control}
                trigger={trigger}
              />
            </div>
            <button
              type="button"
              disabled={true}
              className="w-8 h-8 mb-1.5 rounded flex items-center justify-center text-sm bg-gray-200 text-gray-400 cursor-not-allowed"
              title="Cannot remove the last item"
            >
              <MdDelete fontSize={20} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-start w-full">
            <button
              type="button"
              onClick={addSourceUrl}
              className="cursor-pointer flex items-center justify-center px-2 py-1.5 my-1.5 bg-white text-neutralPrimary-700 border border-neutralPrimary-300 rounded-md hover:bg-neutral-50"
            >
              <MdAdd fontSize={20} className="text-neutralPrimary-700" /> Add
              More Source
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end flex-col gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end w-full">
            <div className="flex items-center gap-3 w-full">
              <InputField
                labelName={`Source URL ${index + 1}`}
                name={`sourceUrls.${index}.url`}
                placeholderText="Enter Source URL"
                control={control}
                trigger={trigger}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSourceUrl(index)}
              disabled={fields.length === 1}
              className={`w-8 h-8 mb-1.5 rounded flex items-center justify-center text-sm transition-colors ${
                fields.length === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-100 text-red-500 hover:bg-red-200 cursor-pointer"
              }`}
              title={
                fields.length === 1
                  ? "Cannot remove the last item"
                  : "Remove item"
              }
            >
              <MdDelete
                fontSize={20}
                className={
                  fields.length === 1 ? "text-gray-400" : "text-destructive-700"
                }
              />
            </button>
          </div>
        ))}
        <div className="flex items-start w-full">
          <button
            type="button"
            onClick={addSourceUrl}
            className="cursor-pointer flex items-center justify-center px-2 py-1.5 my-1.5 bg-white text-neutralPrimary-700 border border-neutralPrimary-300 rounded-md hover:bg-neutral-50"
          >
            <MdAdd fontSize={20} className="text-neutralPrimary-700" /> Add More
            Source
          </button>
        </div>
      </div>
    </div>
  );
}
