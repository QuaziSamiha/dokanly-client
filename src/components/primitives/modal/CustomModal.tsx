import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import React from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ICustomModal } from "@/types";

export default function CustomModal({
  open,
  onOpenChange,
  title,
  subTitle1,
  subTitle2,
  footerButton,
  dialogHeight = "h-auto",
  dialogWidth = "max-w-lg",
}: ICustomModal) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTrigger asChild>
          <button>Hidden Button</button>
        </DialogTrigger>
      </VisuallyHidden>
      <DialogContent className={`${dialogWidth} ${dialogHeight} px-12 py-6`}>
        <VisuallyHidden>
          <DialogTitle>Hidden title</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <Image
            src="/images/ui/illustrations/confirm.png"
            alt="Confirm"
            width={244}
            height={169}
          />
          <div className="flex flex-col gap-2.5">
            <p className="font-semibold text-xl text-neutralPrimary-800">
              {title}
            </p>
            <p className="font-semibold text-sm text-neutralPrimary-600">
              {subTitle1}{" "}
              <span className="text-neutralPrimary-800">{subTitle2}</span>
            </p>
          </div>
        </div>
        <DialogFooter className="flex items-end justify-end gap-4">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-neutral-300 font-semibold text-base text-neutral-600 rounded-lg cursor-pointer px-5 py-2.5"
            >
              Close
            </button>
          </DialogClose>
          {footerButton}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
