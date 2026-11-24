import React from "react";

const BAR = "animate-pulse rounded bg-neutralPrimary-100";

/** Placeholder shaped like the article layout, so nothing jumps on load. */
export function BlogDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading post">
      <div className="bg-gradient-to-b from-greenPrimary-950 to-white">
        <div className="container mx-auto px-4 pb-10 pt-6 sm:pt-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div className={`${BAR} h-4 w-48`} />
            <div className={`${BAR} mt-4 h-6 w-28 rounded-full`} />
            <div className={`${BAR} h-10 w-full`} />
            <div className={`${BAR} h-10 w-3/4`} />
            <div className={`${BAR} mt-2 h-5 w-5/6`} />
            <div className="mt-6 flex items-center gap-3 border-t border-neutralPrimary-100 pt-6">
              <div className="h-10 w-10 animate-pulse rounded-full bg-neutralPrimary-100" />
              <div className="flex flex-col gap-2">
                <div className={`${BAR} h-4 w-32`} />
                <div className={`${BAR} h-3 w-24`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-0 sm:px-4">
        <div className="mx-auto aspect-[4/3] max-w-5xl animate-pulse bg-neutralPrimary-100 sm:aspect-[16/9] sm:rounded-3xl" />
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {["w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map(
            (width, i) => (
              <div key={i} className={`${BAR} h-4 ${width}`} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
