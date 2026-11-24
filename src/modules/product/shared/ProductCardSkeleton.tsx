import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// * Mirrors ProductCard's layout so nothing shifts when real data loads
export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full h-full pb-2">
      {/* Image + button placeholder */}
      <div className="flex flex-col">
        <Skeleton className="w-full aspect-[378/338] rounded-none rounded-t-lg" />
        <Skeleton className="w-full h-10 sm:h-12 rounded opacity-70" />
      </div>

      {/* Name (2 lines) + price placeholder */}
      <div className="flex flex-col gap-1 sm:gap-2 px-1.5 sm:px-2">
        <div className="flex flex-col gap-1.5 min-h-10 md:min-h-12 justify-center">
          <Skeleton className="h-3.5 md:h-4 w-full rounded-sm" />
          <Skeleton className="h-3.5 md:h-4 w-2/3 rounded-sm" />
        </div>
        <Skeleton className="h-4 sm:h-5 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}
