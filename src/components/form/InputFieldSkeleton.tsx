import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fieldBox } from "./formStyles";

export default function InputFieldSkeleton() {
  return (
    <div className={fieldBox}>
      {/* Icon placeholder */}
      <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />

      {/* Input text placeholder */}
      <Skeleton className="h-4 w-full rounded-sm" />
    </div>
  );
}
