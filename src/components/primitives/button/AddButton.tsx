import React from "react";
import { MdAdd } from "react-icons/md";

export interface IAddButton {
  label: string;
  setOpen: (open: boolean) => void;
}

//* COMPACT ON PHONES SO IT SITS ON THE SAME ROW AS THE PAGE TITLE; GROWS FROM sm UP.
export default function AddButton({ label, setOpen }: IAddButton) {
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-greenPrimary-500 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-neutralPrimary-50 transition-colors hover:bg-greenPrimary-600 focus-visible:ring-2 focus-visible:ring-greenPrimary-500/60 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-2 sm:px-6 sm:py-2.5 sm:text-base"
    >
      <MdAdd className="size-5 shrink-0 text-neutralPrimary-50 sm:size-6" />
      {label}
    </button>
  );
}
