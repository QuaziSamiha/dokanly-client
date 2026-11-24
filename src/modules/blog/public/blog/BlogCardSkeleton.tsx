import React from "react";

/**
 * Placeholder grid shown while the published blog list is in flight.
 * The columns and gaps mirror the real grid, so the page does not reflow when
 * the posts arrive.
 */
export function BlogCardSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-16/10 w-full bg-neutral-200 rounded-lg" />
          <div className="h-5 w-11/12 bg-neutral-200 rounded" />
          <div className="h-5 w-2/3 bg-neutral-200 rounded" />
          <div className="h-3 w-full bg-neutral-200 rounded mt-1" />
          <div className="h-3 w-5/6 bg-neutral-200 rounded" />
          <div className="h-3 w-24 bg-neutral-200 rounded mt-1" />
        </div>
      ))}
    </div>
  );
}
