import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder cards shaped like `JobCard`, so the layout does not jump. */
export function JobSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-neutralPrimary-100 bg-white p-5 sm:p-6"
        >
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="ml-auto h-6 w-24 rounded-full max-sm:hidden" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex justify-between border-t border-neutralPrimary-100 pt-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
