"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useController, type FieldValues } from "react-hook-form";
import { Upload, X, ImageIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IImageInput, TImageInput } from "@/types";
import { fieldError, fieldLabel, primaryButton, requiredMark } from "../formStyles";

//? Helper function to get image name
const getImageName = (image: TImageInput): string => {
  if (image instanceof File) return image.name;
  if (typeof image === "string") return image.split("/").pop() || image;
  if (image.name) return image.name;
  if (typeof image === "object" && "filePath" in image) {
    return image.filePath.split("/").pop() || `Media_${image.attachId}`;
  }
  return "Media";
};

//? Helper function to get image URL for preview
const getImageUrl = (image: TImageInput): string => {
  if (image instanceof File) {
    return URL.createObjectURL(image); //? To show a preview, a temporary blob URL that the browser can render as an image.
  }
  if (typeof image === "string") return image;
  return image.filePath; //? If it's not a File, it's likely an image fetched from the backend.
};

//? Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

//? Helper function to check if file is an image
const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

//? Helper function to check if file is a video
const isVideoFile = (file: File): boolean => {
  return file.type.startsWith("video/");
};

//? Helper function to get file type icon
const getFileIcon = (file: TImageInput): React.ReactNode => {
  if (file instanceof File) {
    if (isImageFile(file)) {
      return <ImageIcon className="text-greenPrimary-500" />;
    } else if (isVideoFile(file)) {
      return <FileIcon className="text-blue-500" />;
    }
    return <FileIcon className="text-gray-500" />;
  }

  // For existing files from backend
  const url =
    typeof file === "string"
      ? file
      : typeof file === "object" && "filePath" in file
        ? file.filePath
        : "";
  const extension = url ? getFileExtension(url) : "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return <ImageIcon className="text-greenPrimary-500" />;
  }
  return <FileIcon className="text-gray-500" />;
};

interface IMediaInput<T extends FieldValues> extends Omit<
  IImageInput<T>,
  "multiple" | "maxFileSize"
> {
  maxFileSize?: number;
  acceptedFileTypes?: string[]; // e.g., ['image/*', 'video/*']
  onRemove?: (media: TImageInput) => void;
}

export default function SingleMediaInput<T extends FieldValues>({
  label,
  name,
  control,
  isRequired = false,
  maxFileSize,
  acceptedFileTypes = ["image/*", "video/*"],
  onRemoveImage,
  onRemove,
}: IMediaInput<T>) {
  const [selectedMedia, setSelectedMedia] = useState<TImageInput | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const MAX_FILE_SIZE = maxFileSize ?? 50 * 1024 * 1024; // Default to 50MB
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: isRequired ? `${label} is required` : false,
    },
  });

  // Load existing media from form value
  useEffect(() => {
    if (value) {
      let media: TImageInput;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        (value as object) instanceof File
      ) {
        media = value as File;
      } else if (Array.isArray(value) && value.length > 0) {
        media = value[0];
      } else {
        media = value as TImageInput;
      }

      setSelectedMedia(media);

      // Generate preview URL
      const url = getImageUrl(media);
      setPreviewUrl(url);
    } else {
      setSelectedMedia(null);
      setPreviewUrl("");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file type
    const isAcceptedType = acceptedFileTypes.some((acceptType) => {
      if (acceptType.includes("*")) {
        const type = acceptType.split("/")[0];
        return file.type.startsWith(`${type}/`);
      }
      return acceptType === file.type;
    });

    if (!isAcceptedType) {
      toast.error(
        `File type not supported. Accepted types: ${acceptedFileTypes.join(", ")}`,
      );
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      toast.error(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Clean up previous blob URL if exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedMedia(file);
    onChange(file);

    // Generate new preview URL
    const newUrl = getImageUrl(file);
    setPreviewUrl(newUrl);

    // Reset input value to allow selecting same file again
    e.target.value = "";
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleDelete = () => {
    if (!selectedMedia) return;

    if (
      !(selectedMedia instanceof File) &&
      typeof selectedMedia === "object" &&
      "attachId" in selectedMedia &&
      selectedMedia.attachId &&
      onRemoveImage
    ) {
      onRemoveImage(selectedMedia.attachId);
    }

    // Call custom onRemove callback if provided
    if (onRemove) {
      onRemove(selectedMedia);
    }

    // Cleanup blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Update state
    setSelectedMedia(null);
    setPreviewUrl("");
    onChange(null);
  };

  const handleReplace = () => {
    if (!selectedMedia) return;

    // Cleanup blob URL before replacing
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    openFileDialog();
  };

  // Check if selected media is a video
  const isVideo =
    selectedMedia && selectedMedia instanceof File
      ? isVideoFile(selectedMedia)
      : selectedMedia &&
          typeof selectedMedia === "object" &&
          "filePath" in selectedMedia
        ? ["mp4", "webm", "ogg"].includes(
            getFileExtension(selectedMedia.filePath),
          )
        : false;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ================= LABEL ============= */}
      <label className={fieldLabel}>
        {label}{" "}
        {isRequired && (
          <span className={requiredMark}>*</span>
        )}
      </label>

      <div className="w-full">
        <div className="min-h-48 bg-neutralPrimary-50 border-2 border-dashed border-neutralPrimary-300 rounded-lg py-6 px-4 transition-colors duration-200 hover:border-greenPrimary-300">
          {!selectedMedia ? (
            // Show upload prompt when no media is selected
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="p-3 bg-white rounded-full shadow-sm ring-1 ring-neutralPrimary-200 mt-4">
                  <FileIcon size={24} className="text-greenPrimary-500" />
                </div>
                {/* <p className="text-sm text-neutralPrimary-400 font-medium">
                  Click to Add {label}
                </p> */}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className={`${primaryButton} h-10 px-4`}
                >
                  <Upload size={16} />
                  Upload {label}
                </button>
                <p className="text-xs leading-relaxed text-neutralPrimary-500 text-center">
                  Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB
                  {acceptedFileTypes.length > 0 && (
                    <>
                      <br />
                      Accepted: {acceptedFileTypes.join(", ")}
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            // Show selected media preview with actions
            <div className="flex flex-col gap-4">
              {/* ============== MEDIA PREVIEW ==============  */}
              <div className="relative border border-neutralPrimary-200 rounded-lg overflow-hidden bg-white shadow-sm">
                {/* ========= ACTION BUTTONS ==============  */}
                <div className="absolute right-2 top-2 z-10 flex gap-2">
                  {/* Replace Button */}
                  <button
                    type="button"
                    onClick={handleReplace}
                    className="cursor-pointer p-1.5 bg-white hover:bg-blue-50 rounded-full transition-colors duration-200 shadow-md"
                    title="Replace media"
                  >
                    <Upload size={14} className="text-blue-500" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="cursor-pointer p-1.5 bg-white hover:bg-destructive-50 rounded-full transition-colors duration-200 shadow-md"
                    title="Delete media"
                  >
                    <X size={14} className="text-destructive-500" />
                  </button>
                </div>

                {/* Media Preview */}
                {/* FIXED HEIGHT, NOT aspect-video: IN A WIDE MODAL A 16:9 BOX GROWS TO
                    ~450px AND PUSHES THE FORM INTO A SCROLL. object-contain FITS ANY
                    SHAPE OF MEDIA INSIDE IT WITHOUT CROPPING. */}
                <div className="relative flex h-44 w-full items-center justify-center bg-neutralPrimary-100 sm:h-52 lg:h-56">

                  {isVideo ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      controls
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt={getImageName(selectedMedia)}
                      className="w-full h-full object-contain"
                      width={400}
                      height={300}
                      unoptimized={
                        previewUrl.startsWith("blob:") ||
                        getFileExtension(getImageName(selectedMedia)) === "gif"
                      }
                    />
                  )}
                </div>

                {/* Media Info */}
                <div className="min-w-0 px-3.5 py-3 bg-neutralPrimary-50 border-t border-neutralPrimary-200">
                  <div className="flex min-w-0 items-center gap-2 mb-1">
                    <span className="shrink-0">{getFileIcon(selectedMedia)}</span>
                    {/* min-w-0 lets truncate shorten a long file name with "…"
                        instead of widening the field (and the modal) to fit it. */}
                    <span
                      className="min-w-0 truncate text-sm font-medium text-neutralPrimary-700"
                      title={getImageName(selectedMedia)}
                    >
                      {getImageName(selectedMedia)}
                    </span>
                  </div>
                  {selectedMedia instanceof File && (
                    <p className="text-xs text-neutralPrimary-500">
                      Size: {(selectedMedia.size / (1024 * 1024)).toFixed(2)}MB
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <input
            id={`media-input-${name}`}
            hidden
            type="file"
            accept={acceptedFileTypes.join(",")}
            ref={inputRef}
            onChange={handleMediaChange}
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

// "use client";

// import type React from "react";

// import { useEffect, useState, useRef } from "react";
// import { useController, type FieldValues } from "react-hook-form";
// import { Upload, X, ImageIcon, FileIcon } from "lucide-react";
// import { toast } from "sonner";
// import Image from "next/image";
// import { IImageInput, TImageInput } from "@/types";

// //? Helper function to get image name
// const getImageName = (image: TImageInput): string => {
//   if (image instanceof File) return image.name;
//   if (typeof image === "string") return image.split("/").pop() || image;
//   if (image.name) return image.name;
//   if (typeof image === "object" && "filePath" in image) {
//     return image.filePath.split("/").pop() || `Media_${image.attachId}`;
//   }
//   return "Media";
// };

// //? Helper function to get image URL for preview
// const getImageUrl = (image: TImageInput): string => {
//   if (image instanceof File) {
//     return URL.createObjectURL(image); //? To show a preview, a temporary blob URL that the browser can render as an image.
//   }
//   if (typeof image === "string") return image;
//   return image.filePath; //? If it's not a File, it's likely an image fetched from the backend.
// };

// //? Helper function to get file extension
// const getFileExtension = (filename: string): string => {
//   return filename.split('.').pop()?.toLowerCase() || '';
// };

// //? Helper function to check if file is an image
// const isImageFile = (file: File): boolean => {
//   return file.type.startsWith('image/');
// };

// //? Helper function to check if file is a video
// const isVideoFile = (file: File): boolean => {
//   return file.type.startsWith('video/');
// };

// //? Helper function to get file type icon
// const getFileIcon = (file: TImageInput): React.ReactNode => {
//   if (file instanceof File) {
//     if (isImageFile(file)) {
//       return <ImageIcon className="text-greenPrimary-500" />;
//     } else if (isVideoFile(file)) {
//       return <FileIcon className="text-blue-500" />;
//     }
//     return <FileIcon className="text-gray-500" />;
//   }

//   // For existing files from backend
//   const url =
//     typeof file === "string"
//       ? file
//       : typeof file === "object" && "filePath" in file
//         ? file.filePath
//         : "";
//   const extension = url ? getFileExtension(url) : '';

//   if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
//     return <ImageIcon className="text-greenPrimary-500" />;
//   }
//   return <FileIcon className="text-gray-500" />;
// };

// interface IMediaInput<T extends FieldValues> extends Omit<IImageInput<T>, 'multiple' | 'maxFileSize'> {
//   maxFileSize?: number;
//   acceptedFileTypes?: string[]; // e.g., ['image/*', 'video/*']
//   onRemove?: (media: TImageInput) => void;
// }

// export default function
// SingleMediaInput<T extends FieldValues>({
//   label,
//   name,
//   control,
//   isRequired = false,
//   maxFileSize,
//   acceptedFileTypes = ['image/*', 'video/*'],
//   onRemoveImage,
//   onRemove,
// }: IMediaInput<T>) {
//   const [selectedMedia, setSelectedMedia] = useState<TImageInput | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string>("");
//   const MAX_FILE_SIZE = maxFileSize ?? 50 * 1024 * 1024; // Default to 50MB
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const {
//     field: { onChange, value },
//     fieldState: { error },
//   } = useController({
//     name,
//     control,
//     rules: {
//       required: isRequired ? `${label} is required` : false,
//     },
//   });

//   // Load existing media from form value
//   useEffect(() => {
//     if (value) {
//       let media: TImageInput;

//       if (value !== null && typeof value === 'object' && !Array.isArray(value) && (value as object) instanceof File) {
//         media = value as File;
//       } else if (Array.isArray(value) && value.length > 0) {
//         media = value[0];
//       } else {
//         media = value as TImageInput;
//       }

//       setSelectedMedia(media);

//       // Generate preview URL
//       const url = getImageUrl(media);
//       setPreviewUrl(url);
//     } else {
//       setSelectedMedia(null);
//       setPreviewUrl("");
//     }
//   }, [value]);

//   useEffect(() => {
//     return () => {
//       if (previewUrl && previewUrl.startsWith("blob:")) {
//         URL.revokeObjectURL(previewUrl);
//       }
//     };
//   }, [previewUrl]);

//   const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     const file = files[0];

//     // Check file type
//     const isAcceptedType = acceptedFileTypes.some(acceptType => {
//       if (acceptType.includes('*')) {
//         const type = acceptType.split('/')[0];
//         return file.type.startsWith(`${type}/`);
//       }
//       return acceptType === file.type;
//     });

//     if (!isAcceptedType) {
//       toast.error(`File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`);
//       return;
//     }

//     // Check file size
//     if (file.size > MAX_FILE_SIZE) {
//       const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
//       toast.error(`File exceeds ${maxSizeMB}MB limit`);
//       return;
//     }

//     // Clean up previous blob URL if exists
//     if (previewUrl && previewUrl.startsWith("blob:")) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     setSelectedMedia(file);
//     onChange(file);

//     // Generate new preview URL
//     const newUrl = getImageUrl(file);
//     setPreviewUrl(newUrl);

//     // Reset input value to allow selecting same file again
//     e.target.value = "";
//   };

//   const openFileDialog = () => {
//     inputRef.current?.click();
//   };

//   const handleDelete = () => {
//     if (!selectedMedia) return;

//     if (
//       !(selectedMedia instanceof File) &&
//       typeof selectedMedia === "object" &&
//       "attachId" in selectedMedia &&
//       selectedMedia.attachId &&
//       onRemoveImage
//     ) {
//       onRemoveImage(selectedMedia.attachId);
//     }

//     // Call custom onRemove callback if provided
//     if (onRemove) {
//       onRemove(selectedMedia);
//     }

//     // Cleanup blob URL
//     if (previewUrl && previewUrl.startsWith("blob:")) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     // Update state
//     setSelectedMedia(null);
//     setPreviewUrl("");
//     onChange(null);
//   };

//   const handleReplace = () => {
//     if (!selectedMedia) return;

//     // Cleanup blob URL before replacing
//     if (previewUrl && previewUrl.startsWith("blob:")) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     openFileDialog();
//   };

//   // Check if selected media is a video
//   const isVideo = selectedMedia && selectedMedia instanceof File
//     ? isVideoFile(selectedMedia)
//     : selectedMedia && typeof selectedMedia === 'object' && 'filePath' in selectedMedia
//       ? ['mp4', 'webm', 'ogg'].includes(getFileExtension(selectedMedia.filePath))
//       : false;

//   return (
//     <div className="flex flex-col gap-2 w-full">
//       {/* ================= LABEL ============= */}
//       <label className="text-neutralPrimary-800 text-sm font-semibold md:pl-2">
//         {label}{" "}
//         {isRequired && (
//           <span className="text-destructive-500 text-base px-0.5">*</span>
//         )}
//       </label>

//       <div className="w-full">
//         <div className="min-h-48 bg-gray-50 border-2 border-dashed border-neutralPrimary-300 rounded-md py-6 px-4">
//           {!selectedMedia ? (
//             // Show upload prompt when no media is selected
//             <div className="flex items-center justify-center">
//               <div className="flex flex-col gap-4 items-center">
//                 <div className="p-3 bg-white rounded-full shadow-sm mt-4">
//                   <FileIcon size={24} className="text-greenPrimary-500" />
//                 </div>
//                 {/* <p className="text-sm text-neutralPrimary-400 font-medium">
//                   Click to Add {label}
//                 </p> */}
//                 <button
//                   type="button"
//                   onClick={openFileDialog}
//                   className="cursor-pointer mt-2 px-4 py-2 bg-greenPrimary-500 text-white rounded-md transition-colors duration-200 flex items-center gap-2 hover:bg-greenPrimary-600"
//                 >
//                   <Upload size={16} />
//                   Upload {label}
//                 </button>
//                 <p className="text-xs text-neutralPrimary-400 mt-2 text-center">
//                   Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB
//                   {acceptedFileTypes.length > 0 && (
//                     <>
//                       <br />
//                       Accepted: {acceptedFileTypes.join(', ')}
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             // Show selected media preview with actions
//             <div className="flex flex-col gap-4">
//               {/* ============== MEDIA PREVIEW ==============  */}
//               <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
//                 {/* ========= ACTION BUTTONS ==============  */}
//                 <div className="absolute right-2 top-2 z-10 flex gap-2">
//                   {/* Replace Button */}
//                   <button
//                     type="button"
//                     onClick={handleReplace}
//                     className="cursor-pointer p-1.5 bg-white hover:bg-blue-50 rounded-full transition-colors duration-200 shadow-md"
//                     title="Replace media"
//                   >
//                     <Upload size={14} className="text-blue-500" />
//                   </button>

//                   {/* Delete Button */}
//                   <button
//                     type="button"
//                     onClick={handleDelete}
//                     className="cursor-pointer p-1.5 bg-white hover:bg-red-50 rounded-full transition-colors duration-200 shadow-md"
//                     title="Delete media"
//                   >
//                     <X size={14} className="text-destructive-500" />
//                   </button>
//                 </div>

//                 {/* Media Preview */}
//                 <div className="aspect-video relative bg-gray-100">
//                   {isVideo ? (
//                     <video
//                       src={previewUrl}
//                       className="w-full h-full object-contain"
//                       controls
//                     >
//                       Your browser does not support the video tag.
//                     </video>
//                   ) : (
//                     <Image
//                       src={previewUrl || "/placeholder.svg"}
//                       alt={getImageName(selectedMedia)}
//                       className="w-full h-full object-contain"
//                       width={400}
//                       height={300}
//                       unoptimized={previewUrl.startsWith('blob:')}
//                     />
//                   )}
//                 </div>

//                 {/* Media Info */}
//                 <div className="p-3 bg-gray-50 border-t border-gray-200">
//                   <div className="flex items-center gap-2 mb-1">
//                     {getFileIcon(selectedMedia)}
//                     <span className="text-sm font-medium text-neutralPrimary-700 truncate">
//                       {getImageName(selectedMedia)}
//                     </span>
//                   </div>
//                   {selectedMedia instanceof File && (
//                     <p className="text-xs text-neutralPrimary-500">
//                       Size: {(selectedMedia.size / (1024 * 1024)).toFixed(2)}MB
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <input
//             id={`media-input-${name}`}
//             hidden
//             type="file"
//             accept={acceptedFileTypes.join(',')}
//             ref={inputRef}
//             onChange={handleMediaChange}
//           />
//         </div>
//         {error && (
//           <p className="text-destructive-500 text-xs font-medium pl-2 mt-1">
//             {error.message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
