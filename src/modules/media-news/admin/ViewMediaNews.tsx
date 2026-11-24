"use client";
import CancelButton from "@/components/primitives/button/CancelButton";
import { IModal } from "@/types";
import { IMediaNews } from "../types/media-news.types";
import Image from "next/image";
import React from "react";
import { formatDateToMMDDYYYY } from "@/lib/utils/date.utils"; // Assuming this helper exists in your project
import { getEmbedUrl } from "@/lib/utils/url.utils";
import { getBaseUrl } from "@/config/env.config";

export default function ViewMediaNews({ data, onClose }: IModal) {
  if (!data) return null;

  const rowData = data as IMediaNews;
  const {
    title,
    description,
    mediaUrl,
    videoUrl,
    sourceUrls,
    updatedBy,
    // updatedAt,
    publishedAt,
    // createdAt,
    createdBy,
    category,
    status,
  } = rowData;
  const url = getBaseUrl();
  // console.log(url)
  return (
    <section className="flex flex-col p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <p className="text-2xl font-semibold text-neutralPrimary-800 border-b pb-3 mb-6">
        Media & News Details
      </p>

      <section className="flex flex-col items-center gap-8">
        <main className="flex items-center gap-4 w-full">
          {mediaUrl && (
            <div className="rounded-lg overflow-hidden border border-neutral-200 w-1/2">
              <p className="bg-neutral-50 px-3 py-1 text-xs font-bold uppercase text-neutral-500 border-b">
                Image Content
              </p>
              <Image
                src={mediaUrl}
                alt={title || "Media Image"}
                width={500}
                height={350}
                className="w-full h-[350px] object-contain p-2 rounded-md"
              />
            </div>
          )}

          {videoUrl && (
            <div className="rounded-lg overflow-hidden border border-neutral-200 w-1/2">
              <p className="bg-neutral-50 px-3 py-1 text-xs font-bold uppercase text-neutral-500 border-b">
                Video Content
              </p>
              {rowData?.videoUrl?.includes("/uploads/") ||
              rowData?.videoUrl?.startsWith(url) ? (
                <video
                  controls
                  className="w-full h-[350px] object-cover bg-black"
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="rounded-lg overflow-hidden border border-neutral-200 w-full">
                  <iframe
                    src={getEmbedUrl(rowData.videoUrl)}
                    className="w-full xl:h-[400px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </main>

        <main className="flex flex-col gap-6 w-full">
          {/* Title and Category */}
          <div className="w-full">
            <div className="flex items-center justify-start gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  category === "MEDIA"
                    ? "bg-blueSecondary-100 text-blueSecondary-700"
                    : category === "NEWS"
                      ? "bg-warningPrimary-100 text-warningPrimary-700"
                      : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {category}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  status === "PUBLISHED"
                    ? "bg-success-100 text-success-700"
                    : "bg-destructive-100 text-destructive-700"
                }`}
              >
                {status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutralPrimary-900 leading-tight">
              {title}
            </h3>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Description
            </h4>
            {/* <p className="text-neutral-700 text-sm leading-relaxed text-justify bg-neutral-50 p-3 rounded-md border">
              {description}
            </p> */}
            <div
              className={`text-neutral-700 text-sm leading-relaxed text-justify bg-neutral-50 p-3 rounded-md border`}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4 w-full">
            <div>
              <p className="text-[11px] text-neutral-400 uppercase font-bold">
                Published At
              </p>
              <p className="text-sm text-neutral-800 font-medium">
                {formatDateToMMDDYYYY(publishedAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 uppercase font-bold">
                Created By
              </p>
              <p className="text-sm text-neutral-800 font-medium">
                {createdBy?.name || "N/A"}
              </p>
            </div>
            {updatedBy && (
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-bold">
                  Updated By
                </p>
                <p className="text-sm text-neutral-800 font-medium">
                  {updatedBy?.name || "N/A"}
                </p>
              </div>
            )}
            {sourceUrls && sourceUrls.length > 0 && (
              <div className="col-span-2">
                <p className="text-[11px] text-neutral-400 uppercase font-bold mb-1">
                  Source Links
                </p>
                <div className="flex flex-col flex-wrap gap-2">
                  {sourceUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline truncate max-w-full block"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </section>

      <div className="flex justify-end mt-8 pt-4 border-t">
        <CancelButton onClick={onClose} label="Close" />
      </div>
    </section>
  );
}
