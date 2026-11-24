"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MediaNewsDetailsSkeleton() {
  return (
    <section className="w-full animate-pulse">
      {/* 1. Hero Skeleton */}
      <div className="w-full h-[300px] bg-gray-100 flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-1/3 mb-4" /> {/* heroHeading placeholder */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" /> {/* Breadcrumb link 1 */}
            <Skeleton className="h-4 w-4" />  {/* Breadcrumb separator */}
            <Skeleton className="h-4 w-32" /> {/* Breadcrumb current */}
          </div>
        </div>
      </div>

      <main className="container mx-auto">
        <section className="flex flex-col gap-20 py-20">
          {/* 2. Media Section Skeleton */}
          <section className="flex items-center w-full">
            <div className="w-full lg:w-1/2">
              <Skeleton className="w-full h-[450px] rounded-lg" />
            </div>
          </section>

          {/* 3. Text Content Skeleton */}
          <section className="flex flex-col gap-6">
            {/* Title Skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>

            {/* Description Paragraphs Skeleton */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Source URLs Skeleton */}
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </section>
        </section>
      </main>
    </section>
  );
}