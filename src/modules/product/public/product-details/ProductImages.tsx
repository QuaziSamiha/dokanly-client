"use client";

import { IProductImage } from "@/modules/product/types/product.types";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";

interface IProps {
  images: IProductImage[];
  productName: string;
  percentOff?: number;
  isOutOfStock?: boolean;
}

const SWIPE_THRESHOLD = 40;

export default function ProductImages({
  images,
  productName,
  percentOff = 0,
  isOutOfStock = false,
}: IProps) {
  // * Primary image first, then the admin-defined order
  const gallery = useMemo(
    () =>
      [...(images ?? [])]
        .filter((image) => image.isActive !== false && image.url)
        .sort(
          (a, b) =>
            Number(b.isPrimary) - Number(a.isPrimary) || a.order - b.order
        ),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const touchStartX = useRef<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = gallery.length;
  const activeImage = gallery[Math.min(activeIndex, total - 1)];
  const hasMany = total > 1;

  const select = (index: number) => {
    const next = (index + total) % total;
    setActiveIndex(next);
    thumbRefs.current[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMany) return;
    if (e.key === "ArrowLeft") select(activeIndex - 1);
    if (e.key === "ArrowRight") select(activeIndex + 1);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMany) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) select(activeIndex + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  if (!activeImage) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl bg-neutralPrimary-100 text-neutralPrimary-400">
        <ImageOff className="size-10" aria-hidden />
        <span className="text-sm">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* //* ========== MAIN IMAGE ========= */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} images`}
        tabIndex={hasMany ? 0 : -1}
        onKeyDown={handleKeyDown}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        className="group/gallery relative min-w-0 flex-1 overflow-hidden rounded-xl border border-neutralPrimary-100 bg-neutralPrimary-50 sm:rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-400"
      >
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomOrigin("50% 50%")}
          className="group/zoom relative aspect-square w-full cursor-zoom-in overflow-hidden"
        >
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.altText || productName}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 576px, 50vw"
            style={{ transformOrigin: zoomOrigin }}
            className={`animate-in fade-in object-contain duration-300 transition-transform sm:p-6 lg:p-8 lg:group-hover/zoom:scale-[1.8] ${
              isOutOfStock ? "opacity-60" : ""
            }`}
          />
        </div>

        {/* Badges */}
        <div className="pointer-events-none absolute top-2 left-2 flex flex-col items-start gap-2 sm:top-3 sm:left-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-neutralPrimary-800/90 px-2.5 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-xs font-semibold text-white">
              Out of stock
            </span>
          ) : (
            percentOff > 0 && (
              <span className="rounded-full bg-warningPrimary-500 px-2.5 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-xs font-bold text-white shadow-sm">
                -{percentOff}% OFF
              </span>
            )
          )}
        </div>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => select(activeIndex - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 flex size-8 sm:left-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutralPrimary-800 shadow-md transition hover:bg-white sm:size-10 lg:opacity-0 lg:group-hover/gallery:opacity-100 lg:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              onClick={() => select(activeIndex + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 flex size-8 sm:right-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutralPrimary-800 shadow-md transition hover:bg-white sm:size-10 lg:opacity-0 lg:group-hover/gallery:opacity-100 lg:focus-visible:opacity-100"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
            <span className="absolute right-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] sm:right-3 sm:bottom-3 sm:px-2.5 sm:text-xs font-medium text-white tabular-nums">
              {activeIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* //* ========== THUMBNAILS ========= */}
      {hasMany && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 sm:gap-2.5 [scrollbar-width:none] lg:max-h-[560px] lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0 xl:w-24 [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id ?? image.url}
                ref={(el) => {
                  thumbRefs.current[index] = el;
                }}
                type="button"
                onClick={() => select(index)}
                aria-label={`Show image ${index + 1} of ${total}`}
                aria-current={isActive}
                className={`relative aspect-square w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-neutralPrimary-100 transition min-[400px]:w-16 sm:w-20 lg:w-full ${
                  isActive
                    ? "border-greenPrimary-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
