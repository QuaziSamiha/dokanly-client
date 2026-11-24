"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface IProfileAvatar {
  src?: string | null;
  name?: string | null;
  /** Sizing classes for the circle, e.g. "w-24 h-24" */
  sizeClass?: string;
  /** Text size of the initial shown when there is no usable image */
  fallbackTextClass?: string;
  bordered?: boolean;
}

export default function ProfileAvatar({
  src,
  name,
  sizeClass = "w-10 h-10",
  fallbackTextClass = "text-sm",
  bordered = false,
}: IProfileAvatar) {
  //* ==== A STORED URL IS NOT A GUARANTEE THE FILE IS STILL THERE — A DELETED
  //* OR UNREACHABLE IMAGE FALLS BACK TO THE INITIAL INSTEAD OF LEAVING A
  //* BROKEN IMAGE BEHIND. ====
  const [hasError, setHasError] = useState(false);

  //* ==== A NEW UPLOAD / REMOVAL DESERVES A FRESH ATTEMPT ====
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const borderClass = bordered ? "border-2 border-neutralPrimary-100" : "";

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} ${borderClass} ${fallbackTextClass} rounded-full bg-greenPrimary-50 text-greenPrimary-700 flex items-center justify-center font-semibold shrink-0`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${borderClass} relative rounded-full overflow-hidden shrink-0`}
    >
      <Image
        src={src}
        alt={name ?? "Profile"}
        fill
        unoptimized={src.startsWith("blob:")}
        className="object-cover"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
