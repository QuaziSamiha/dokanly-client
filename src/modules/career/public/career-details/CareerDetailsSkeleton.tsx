import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder shaped like the job page: header, description, summary card. */
export default function CareerDetailsSkeleton() {
  return (
    <main className="container mx-auto px-4 pb-16 pt-6 lg:pt-10" aria-hidden>
      <Skeleton className="mb-5 h-4 w-36" />

      <div className="flex flex-col gap-4 rounded-2xl bg-careerBg p-5 sm:p-8">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-2/3 max-sm:w-full" />
        <div className="flex gap-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="flex flex-col gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-neutralPrimary-100 p-6 max-lg:order-first">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-full max-lg:hidden" />
        </div>
      </div>
    </main>
  );
}
