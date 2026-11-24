"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useController, type FieldValues } from "react-hook-form";
import { Upload, X, ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IImageInput, IImagePreview, TImageInput } from "@/types";
import { fieldError, fieldLabel, primaryButton, requiredMark } from "../formStyles";

const getImageName = (image: TImageInput): string => {
  if (image instanceof File) return image.name;
  if (typeof image === "string") return image.split("/").pop() || image;
  if (image.name) return image.name;
  if (typeof image === "object" && "filePath" in image) {
    return image.filePath.split("/").pop() || `Image_${image.attachId}`;
  }
  return "Image";
};

const getImageUrl = (image: TImageInput): string => {
  if (image instanceof File) return URL.createObjectURL(image);
  if (typeof image === "string") return image;
  return image.filePath;
};

export default function ImageInput<T extends FieldValues>({
  label,
  name,
  control,
  isRequired = false,
  maxFileSize,
  multiple = true,
  onRemoveImage,
}: IImageInput<T>) {
  const [selectedImages, setSelectedImages] = useState<TImageInput[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);
  const MAX_FILE_SIZE = maxFileSize ?? 10 * 1024 * 1024;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: isRequired ? `${label} is required` : false },
  });

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const normalizedImages: TImageInput[] = value.map(
        (image: TImageInput): TImageInput => {
          if (image instanceof File) return image;
          if (typeof image === "string") return image;
          return { ...image, name: getImageName(image) } as IImagePreview;
        }
      );
      setSelectedImages(normalizedImages);
      setPreviewUrls(normalizedImages.map(getImageUrl));
    }
  }, [value]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validImages: File[] = [];
    let hasSizeError = false;
    let hasTypeError = false;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) { hasTypeError = true; return; }
      if (file.size > MAX_FILE_SIZE) { hasSizeError = true; return; }
      validImages.push(file);
    });

    if (hasTypeError) toast.error("Only image files are allowed (PNG, JPG, JPEG, GIF, WebP, etc.)");
    if (hasSizeError) toast.error(`Some images exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);

    if (validImages.length > 0) {
      const updatedImages = multiple ? [...selectedImages, ...validImages] : validImages;
      setSelectedImages(updatedImages);
      setPreviewUrls(updatedImages.map(getImageUrl));
      onChange(updatedImages);
    }

    e.target.value = "";
  };

  const handleDelete = (index: number) => {
    const deletedImage = selectedImages[index];

    if (
      !(deletedImage instanceof File) &&
      typeof deletedImage === "object" &&
      "attachId" in deletedImage &&
      deletedImage.attachId &&
      onRemoveImage
    ) {
      onRemoveImage(deletedImage.attachId);
    }

    if (previewUrls[index]?.startsWith("blob:")) URL.revokeObjectURL(previewUrls[index]);

    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedImages(updatedImages);
    setPreviewUrls(updatedUrls);
    onChange(updatedImages);
  };

  // ============ DRAG AND DROP HANDLERS ============

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;

    const newImages = [...selectedImages];
    const newUrls = [...previewUrls];

    const [movedImage] = newImages.splice(from, 1);
    const [movedUrl] = newUrls.splice(from, 1);
    newImages.splice(dropIndex, 0, movedImage);
    newUrls.splice(dropIndex, 0, movedUrl);

    setSelectedImages(newImages);
    setPreviewUrls(newUrls);
    onChange(newImages);
    dragIndex.current = null;
    setDraggingIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDraggingIndex(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className={fieldLabel}>
        {label}{" "}
        {isRequired && <span className={requiredMark}>*</span>}
      </label>

      <div className="w-full">
        <div className="min-h-40 bg-neutralPrimary-50 border-2 border-dashed border-neutralPrimary-300 rounded-lg py-6 px-4 transition-colors duration-200 hover:border-greenPrimary-300">
          {selectedImages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col gap-4 items-center">
                <div className="p-3 bg-white rounded-full shadow-sm ring-1 ring-neutralPrimary-200">
                  <ImageIcon size={24} className="text-greenPrimary-500" />
                </div>
                <p className="text-sm text-neutralPrimary-500 font-medium">
                  Click to Add {label}
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`${primaryButton} h-10 px-4`}
                >
                  <Upload size={16} />
                  Add {label}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutralPrimary-500">
                  Drag to reorder · First image is the primary image
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`${primaryButton} h-9 px-3.5 shrink-0`}
                >
                  <Upload size={14} />
                  Add More
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((image, index) => {
                  const isPrimary = index === 0;
                  const isDragging = draggingIndex === index;
                  const key =
                    image instanceof File
                      ? `${image.name}-${index}`
                      : typeof image === "object" && "attachId" in image && image.attachId
                        ? `${image.attachId}-${index}`
                        : `${getImageName(image)}-${index}`;

                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative border rounded-lg overflow-hidden bg-white shadow-sm transition-opacity duration-150 ${
                        isPrimary
                          ? "border-greenPrimary-500 ring-2 ring-greenPrimary-300"
                          : "border-neutralPrimary-200"
                      } ${isDragging ? "opacity-40" : "opacity-100"}`}
                    >
                      {/* Primary badge */}
                      {isPrimary && (
                        <div className="absolute top-2 left-2 z-10 bg-greenPrimary-500 text-white text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md shadow-sm">
                          Primary
                        </div>
                      )}

                      {/* Drag handle */}
                      <div className="absolute left-2 bottom-2 z-10 p-1 rounded-md bg-white/90 shadow-sm cursor-grab active:cursor-grabbing text-neutralPrimary-500">
                        <GripVertical size={16} />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="cursor-pointer absolute right-2 top-2 z-10 p-1.5 bg-white hover:bg-destructive-50 rounded-full transition-colors duration-200 shadow-md"
                        title="Delete image"
                      >
                        <X size={14} className="text-destructive-500" />
                      </button>

                      {/* Image */}
                      <div className="aspect-square relative bg-neutralPrimary-100">
                        <Image
                          src={previewUrls[index] || "/placeholder.svg"}
                          alt={getImageName(image)}
                          className="w-full h-full object-cover"
                          width={200}
                          height={200}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <input
            id={`image-input-${name}`}
            hidden
            type="file"
            accept="image/*"
            multiple={multiple}
            ref={inputRef}
            onChange={handleImageChange}
          />
        </div>
        {error && (
          <p className={`${fieldError} mt-1.5`}>
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
