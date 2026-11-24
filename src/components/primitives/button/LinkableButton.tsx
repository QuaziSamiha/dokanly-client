import Link from "next/link";
import React from "react";

export interface ICommonButtonProps {
  label: string;
  link: string;
}

export default function LinkableButton({ label, link }: ICommonButtonProps) {
  return (
    <Link href={link}>
      <button
        type="button"
        className="bg-greenPrimary-500 text-neutralPrimary-50 font-semibold text-base rounded-lg w-full py-3.5 cursor-pointer"
      >
        {label}
      </button>
    </Link>
  );
}
