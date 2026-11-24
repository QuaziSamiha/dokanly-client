import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// * Mirrors ProductImages' layout so nothing shifts when real data loads
export default function ProductImagesSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <Skeleton className="aspect-square w-full flex-1 rounded-xl sm:rounded-2xl" />
      <div className="flex gap-2 sm:gap-2.5 lg:w-20 lg:flex-col xl:w-24">
        {[...Array(4)].map((_, index) => (
          <Skeleton
            key={index}
            className="aspect-square w-14 shrink-0 rounded-lg min-[400px]:w-16 sm:w-20 lg:w-full"
          />
        ))}
      </div>
    </div>
  );
}
