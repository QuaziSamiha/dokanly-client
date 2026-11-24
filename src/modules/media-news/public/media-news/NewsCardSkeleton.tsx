import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsCardSkeleton() {
  return (
    // Match the outer padding and border of NewsCard
    <div className="bg-white border border-neutralPrimary-100 rounded-xl p-4 flex flex-col w-full h-full animate-pulse">
      <div className="flex flex-col gap-6">
        
        {/* Image Placeholder */}
        <Skeleton className="w-full h-[200px] rounded-lg" />

        {/* Text Content Placeholders */}
        <div className="flex flex-col gap-4">
          {/* Title Lines */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-full rounded-sm" />
            <Skeleton className="h-6 w-2/3 rounded-sm" />
          </div>

          {/* Description Lines */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
          </div>
        </div>

      </div>
    </div>
  );
}