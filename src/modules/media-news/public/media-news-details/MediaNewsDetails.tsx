"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import Hero from "@/components/layout/hero/Hero";
import { truncateText } from "@/lib/utils/text.utils";
import { usePublicMediaNewsDetails } from "../../hooks/usePublicMediaNews";
import MediaNewsDetailsSkeleton from "./MediaNewsDetailsSkeleton";

export default function MediaNewsDetails() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;

  const { mediaNews: newsDetailsData, isMediaNewsLoading } =
    usePublicMediaNewsDetails(slug);

  const truncatedTitle = truncateText(newsDetailsData?.title || "", 15);

  return (
    <section className="w-full">
      <Hero
        heroHeading="Media & News"
        customBreadCrumb={
          <CustomBreadCrumb
            previousItemLinks={[{ label: "Media & News", link: "/media-news" }]}
            currentItem={truncatedTitle || "Media News Details"}
          />
        }
      />

      {isMediaNewsLoading ? (
        <MediaNewsDetailsSkeleton />
      ) : (
        <main className="container mx-auto px-4 md:px-6">
          {/* Main content wrapper with responsive vertical padding */}
          <section className="flex flex-col gap-10 md:gap-16 lg:gap-20 py-10 md:py-16 lg:py-20">
            {/* Top Section: Media and Title */}
            <section className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-6 md:gap-8 lg:gap-12">
              {/* Media Container (Image/Video) */}
              <div className="w-full lg:w-1/2">
                {newsDetailsData?.mediaUrl && !newsDetailsData?.videoUrl && (
                  <div className="relative w-full h-[250px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-xl shadow-sm">
                    <Image
                      src={newsDetailsData.mediaUrl}
                      alt={newsDetailsData.title || "Media News Image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                {newsDetailsData?.videoUrl && (
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video controls className="w-full h-full object-cover">
                      <source
                        src={newsDetailsData?.videoUrl}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>

              {/* Title Section */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutralPrimary-700 leading-tight">
                  {newsDetailsData?.title}
                </h1>
                <div className="prose prose-neutral max-w-none">
                  {newsDetailsData?.description && (
                    <div
                      className={`text-justify text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed`}
                      dangerouslySetInnerHTML={{
                        __html: newsDetailsData?.description,
                      }}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Bottom Section: Source links */}
            <section className="flex flex-col gap-6">
              {/* Source URLs with responsive flex wrap */}
              {newsDetailsData?.sourceUrls &&
                newsDetailsData.sourceUrls.length > 0 && (
                  <div className="">
                    <h4 className="text-sm font-semibold text-neutral-500 mb-3 uppercase tracking-wider">
                      Sources:
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      {newsDetailsData.sourceUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 text-sm md:text-base font-medium break-all hover:underline bg-blue-50 px-3 py-1 rounded-md transition-colors"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </section>
          </section>
        </main>
      )}
    </section>
  );
}
