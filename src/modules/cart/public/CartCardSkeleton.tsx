import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartCardSkeleton() {
  return (
    <div className="py-6 border-b border-neutralPrimary-300">
      <div className="flex flex-row items-start gap-4">
        {/* Image placeholder */}
        <div className="shrink-0 bg-backgroundPeach rounded-lg w-fit p-2 flex items-center justify-center">
          <Skeleton className="w-[60px] h-[60px] rounded-md" />
        </div>

        {/* Text placeholders */}
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4 rounded-md" /> {/* name */}
          <Skeleton className="h-3 w-1/4 rounded-md" /> {/* quantity */}
        </div>

        {/* Price placeholder */}
        <div className="flex-none">
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}
