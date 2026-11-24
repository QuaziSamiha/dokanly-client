"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useHomeContent } from "@/modules/home/hooks/useHomeContent";

export default function ProductSpotlight() {
  const { productArticles, isHomeContentLoading } = useHomeContent();

  const plugin = React.useMemo(
    () =>
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
      }),
    [],
  );

  if (isHomeContentLoading) {
    return <ProductSpotlightSkeleton />;
  }

  if (!productArticles || productArticles.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 2xl:mx-0">
      <main className="w-full overflow-hidden">
        <Carousel
          plugins={[plugin]}
          className="w-full"
          onMouseEnter={plugin.stop}
          onMouseLeave={plugin.reset}
        >
          <CarouselContent>
            {productArticles.map((item, index) => (
              <CarouselItem key={index} className="w-full">
                <section
                  className={`flex flex-col lg:flex-row items-stretch w-full ${
                    index === 0
                      ? "bg-linear-to-r from-[#F7FAE7] to-[#E4F0C6]"
                      : index === 1
                        ? "bg-linear-to-r from-[#FFF7EA] to-[#E7DCC4]"
                        : "bg-linear-to-r from-[#E4F2E0] to-[#A5C39D]"
                  }`}
                >
                  <div className="order-2 lg:order-1 w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 md:p-12 overflow-hidden">
                    <h2
                      className={`${
                        index === 1 ? "text-[#624300]" : "text-greenPrimary-600"
                      } text-xl lg:text-2xl xl:text-3xl font-bold text-center leading-tight`}
                    >
                      {item.title}
                    </h2>

                    {item.description && (
                      <div
                        className={`${
                          index === 1
                            ? "text-[#624300]"
                            : "text-greenPrimary-600"
                        } line-clamp-8 flex flex-col gap-2 text-center text-sm md:text-base prose prose-sm max-w-full break-words`}
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      />
                    )}
                  </div>
                  <div className="order-1 lg:order-2 w-full lg:w-1/2 flex items-center justify-center">
                    {item.image && !isHomeContentLoading && (
                      <Image
                        src={item.image}
                        alt={item.title || "Product Spotlight"}
                        width={820}
                        height={432}
                        className="object-contain w-full h-auto max-h-full"
                        priority
                      />
                    )}
                  </div>
                </section>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
    </section>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

function ProductSpotlightSkeleton() {
  return (
    <section className="mx-4 2xl:mx-0">
      <div className="w-full overflow-hidden border rounded-lg">
        {/* Matches the flex-col lg:flex-row layout */}
        <div className="flex flex-col lg:flex-row items-stretch w-full min-h-[450px] bg-gray-50">
          {/* Text Side Skeleton */}
          <div className="order-2 lg:order-1 w-full lg:w-1/2 flex flex-col gap-6 items-center justify-center p-6 md:p-12">
            <Skeleton className="h-10 w-3/4" /> {/* Title */}
            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Image Side Skeleton */}
          <div className="order-1 lg:order-2 w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-100">
            {/* Matches your 820/432 Aspect Ratio approx */}
            <Skeleton className="aspect-[820/432] w-full max-w-[500px] rounded-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
