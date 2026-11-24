"use client";

import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

//* Product image with a neutral fallback when the url is missing or broken.
//* unoptimized: urls come from the API host, which varies per environment.
export default function ProductThumb({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const box = cn(
    "shrink-0 rounded-lg bg-neutralPrimary-50 ring-1 ring-black/[0.04] overflow-hidden flex items-center justify-center",
    className,
  );

  if (!src || failed) {
    return (
      <span className={box} style={{ width: size, height: size }}>
        <Package className="h-1/2 w-1/2 text-neutralPrimary-300" />
      </span>
    );
  }
  return (
    <span className={box} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
