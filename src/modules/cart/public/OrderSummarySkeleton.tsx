import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Discount */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Delivery Charge */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Separator */}
      <Skeleton className="h-px w-full" />

      {/* Grand Total */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>

      {/* Button */}
      <Skeleton className="h-10 w-full rounded-[8px]" />
    </div>
  );
}
