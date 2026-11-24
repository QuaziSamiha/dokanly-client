import React from "react";
import { cn } from "@/lib/utils";

/**
 * Action bar for form modals: stays pinned to the bottom of the modal's scroll
 * area, so Cancel and Save are always in reach without scrolling to the end
 * of a long form. Counterpart of ModalHeader.
 *
 * Place it as the last child of the <form> (so a submit button inside still
 * submits) in a `p-4 sm:p-6` wrapper (HOME_FORM_WRAPPER): the negative
 * margins pull its white backing out to the modal's side and bottom edges,
 * over the wrapper's padding.
 *
 * Phones get two equal buttons side by side (one short row instead of two
 * stacked ones); larger screens right-align them. Put Cancel first and the
 * primary action last.
 */
export default function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 -mb-4 w-[calc(100%+2rem)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:w-[calc(100%+3rem)] sm:px-6 sm:py-4",
        // A soft upward shadow separates it from the content scrolling underneath.
        "border-t border-neutralPrimary-200 shadow-[0_-10px_20px_-16px_rgba(17,24,39,0.25)]",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
