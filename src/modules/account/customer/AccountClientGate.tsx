"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/useHasMounted";
import React from "react";

/**
 * The account pages show only the signed-in customer's own data, and who that
 * is can only be read from the cookie in the browser. Server-rendering them
 * would produce a "signed-out" page that the browser then replaces (a
 * hydration error) and they are never indexed, so they render on the client
 * only, behind a skeleton of the same layout.
 */
export default function AccountClientGate({ children }: { children: React.ReactNode }) {
  const hasMounted = useHasMounted();
  if (hasMounted) return <>{children}</>;

  return (
    <div className="flex w-full flex-col lg:flex-row items-start gap-6 lg:gap-8" aria-busy="true">
      <div className="w-full lg:w-72 xl:w-80 shrink-0">
        <div className="flex gap-2 lg:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="hidden lg:block h-[460px] w-full rounded-2xl" />
      </div>
      <div className="flex flex-1 w-full flex-col gap-6 min-w-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
