"use client";

import { ICategorizedMediaNewsItem } from "../../types/media-news.types";
import Image from "next/image";
import Link from "next/link";

export function NewsCard({
  title,
  slug,
  description,
  mediaUrl,
}: ICategorizedMediaNewsItem) {
  return (
    <Link href={`/media-news-details/${slug}`} className="flex h-full w-full">
      <div className="bg-white border border-neutralPrimary-100 shadow-newsCard rounded-xl p-4 flex flex-col w-full">
        <div className="flex flex-col h-full">
          <div className="relative w-full h-[200px] flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden mb-6">
            {mediaUrl ? (
              <Image
                src={mediaUrl}
                alt={title}
                width={345}
                height={200}
                className="w-full h-[200px] object-center rounded-lg"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="flex flex-col flex-grow gap-4">
            <h3 className="text-2xl text-greenPrimary-600 font-semibold line-clamp-2">
              {title}
            </h3>
            {/* <p className="font-semibold text-base text-neutralPrimary-600 line-clamp-2 mt-auto">
              {description}
            </p> */}
            <div
              className={`font-semibold text-base text-neutralPrimary-600 line-clamp-2 mt-auto`}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
