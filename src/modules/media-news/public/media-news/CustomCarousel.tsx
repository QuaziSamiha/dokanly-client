import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ICategorizedMediaNewsItem } from "../../types/media-news.types";
import React from "react";
import { NewsCard } from "./NewsCard";
import NewsCardSkeleton from "./NewsCardSkeleton";

export default function CustomCarousel({
  sectionName,
  news,
  isLoading,
}: {
  sectionName: string;
  news: ICategorizedMediaNewsItem[];
  isLoading: boolean;
}) {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-[1440px]">
        <Carousel>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl text-neutralPrimary-700 font-bold">
                {sectionName}
              </h1>
              <div className="flex justify-end gap-4 mt-8">
                <CarouselPrevious className="cursor-pointer static text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
                <CarouselNext className="cursor-pointer static text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
              </div>
            </div>

            <CarouselContent className="items-stretch">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
                  >
                    <NewsCardSkeleton />
                  </CarouselItem>
                ))
              ) : (
                <>
                  {news?.map((item, index) => (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
                    >
                      <NewsCard key={item?.id} {...item} />
                    </CarouselItem>
                  ))}
                </>
              )}
            </CarouselContent>
          </section>
        </Carousel>
      </div>
    </div>
  );
}
