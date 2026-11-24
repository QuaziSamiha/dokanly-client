import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Left Side: Name and Contact */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-40" /> {/* Name */}
            <Skeleton className="h-5 w-24 rounded-full" /> {/* Date Badge */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
            <Skeleton className="h-4 w-32" /> {/* Email */}
            <Skeleton className="h-4 w-32" /> {/* Phone */}
            <Skeleton className="h-4 w-full md:col-span-2" /> {/* Address */}
          </div>
        </div>

        {/* Right Side: Experience and Skills */}
        <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
          <Skeleton className="h-5 w-32" /> {/* Experience label */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-4 border-t flex justify-between items-center">
        <Skeleton className="h-10 w-32 rounded-lg" /> {/* View Resume Button */}
        <Skeleton className="h-10 w-40 rounded-lg" /> {/* Delete Button */}
      </div>
    </div>
  );
}