export default function PaginationSkeleton() {
  return (
    <section className="animate-pulse rounded-lg border border-neutralPrimary-200 bg-white px-4 py-3 shadow-neutral02 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Left side: Showing X–Y from Z */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 rounded bg-neutralPrimary-200"></div>
          <div className="h-3 w-10 rounded bg-neutralPrimary-200"></div>
          <div className="h-3 w-8 rounded bg-neutralPrimary-200"></div>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="h-8 w-8 rounded-md bg-neutralPrimary-200"></div>
          <div className="h-8 w-8 rounded-md bg-neutralPrimary-200"></div>
          <div className="h-8 w-8 rounded-md bg-neutralPrimary-200"></div>
          <div className="h-8 w-8 rounded-md bg-neutralPrimary-200"></div>
          <div className="h-8 w-8 rounded-md bg-neutralPrimary-200"></div>
        </div>
      </div>
    </section>
  );
}
