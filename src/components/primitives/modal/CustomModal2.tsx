import {
  Dialog,
  DialogClose,
  //   DialogClose,
  DialogContent,
  DialogFooter,
  //   DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ICustomModal2 } from "@/types";

export default function CustomModal2({
  open,
  onOpenChange,
  // footerButton,
  footerRequired,
  dialogHeight = "h-auto",
  dialogWidth = "w-[60vw]",
  hasOwnTitle = false,
  children,
}: ICustomModal2) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTrigger asChild>
          <button>Hidden Button</button>
        </DialogTrigger>
      </VisuallyHidden>
      {/* <DialogContent className={`${dialogWidth} ${dialogHeight} mt-8 border-8 border-green-500`}> */}
      <DialogContent className={`${dialogWidth} ${dialogHeight} overflow-y-auto scroll-auto mt-8 overflow-x-hidden`}>
        {/* Children that render their own DialogTitle opt out of this
            placeholder, so screen readers announce the real title. */}
        {!hasOwnTitle && (
          <VisuallyHidden>
            <DialogTitle>Hidden title</DialogTitle>
          </VisuallyHidden>
        )}
        {children}
      </DialogContent>
      {footerRequired && (
        <DialogFooter className="flex items-end justify-end gap-4">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-neutral-300 font-semibold text-base text-neutral-600 rounded-lg cursor-pointer px-5 py-2.5"
            >
              Close
            </button>
          </DialogClose>
          {/* {footerButton} */}
        </DialogFooter>
      )}
    </Dialog>
  );
}
