import {
  Dialog,
  DialogClose,
  //   DialogClose,
  DialogContent,
  //   DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ICustomModal2 } from "@/types";
import React from "react";

export default function CustomModalStaticTitleFooter({
  open,
  onOpenChange,
  footerRequired,
  dialogHeight = "h-auto",
  dialogWidth = "w-[60vw]",
  children,
}: ICustomModal2) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTrigger asChild>
          <button>Hidden Button</button>
        </DialogTrigger>
      </VisuallyHidden>

      <DialogContent
        className={`${dialogWidth} ${dialogHeight} mt-8 flex flex-col p-0`}
      >
        <VisuallyHidden>
          <DialogTitle>Hidden title</DialogTitle>
        </VisuallyHidden>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footerRequired && (
          <div className="flex-shrink-0 p-6 border-t bg-gray-50">
            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <button
                  type="button"
                  className="border border-neutral-300 font-semibold text-base text-neutral-600 rounded-lg cursor-pointer px-5 py-2.5 hover:bg-gray-100"
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}