import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IModalHeader {
  title: string;
  description?: string;
  /** Small label above the title, e.g. the area the form belongs to. */
  eyebrow?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Heading for form modals. Sticks to the top of the modal's scroll area, so
 * the title stays visible on long forms. It assumes the usual `p-4 sm:p-6` wrapper
 * inside a dialog without its own padding (see HOME_MODAL_DIALOG_CLASS): the
 * negative margins pull the white backing out to the modal's edges, and
 * `top-0` pins it there with its full top padding. (A negative `top` would let it
 * slide up under the edge and lose that padding while scrolling.)
 * `pr-10` leaves room for the dialog's own close button.
 */
export default function ModalHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  className,
}: IModalHeader) {
  return (
    <header
      className={cn(
        // Mirrors the form's `p-4 sm:p-6` (HOME_FORM_WRAPPER) at every breakpoint.
        "sticky top-0 z-20 -mx-4 -mt-4 mb-5 bg-white/95 px-4 pt-4 pb-4 pr-10 backdrop-blur sm:-mx-6 sm:-mt-6 sm:mb-6 sm:px-6 sm:pt-6 sm:pb-5",
        "border-b border-neutralPrimary-200",
        className,
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {Icon ? (
          <span className="inline-flex size-10 shrink-0 sm:size-11 items-center justify-center rounded-xl bg-gradient-to-br from-greenPrimary-500/15 to-greenPrimary-500/5 text-greenPrimary-600 ring-1 ring-greenPrimary-500/15">
            <Icon className="size-5" />
          </span>
        ) : null}

        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-greenPrimary-600 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg leading-tight font-semibold tracking-tight text-neutralPrimary-800 sm:text-xl md:text-[22px]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-neutralPrimary-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
