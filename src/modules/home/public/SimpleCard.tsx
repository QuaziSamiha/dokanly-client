import { ISimpleCard } from "@/types";
import Image from "next/image";
import React from "react";

export default function SimpleCard({
  //   id,
  icon,
  title,
  subTitle,
}: ISimpleCard) {
  return (
    <div className="w-full max-w-xs h-full p-3 sm:p-6">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image
          src={icon}
          alt={title}
          width={64}
          height={60}
          className="w-auto h-[60px]"
        />
        <div className="flex flex-col gap-2 text-center text-blackPrimary hyphens-auto break-words">
          <p className="max-md:text-sm text-lg font-semibold">{title}</p>
          <p className="max-md:text-xs text-base font-normal">{subTitle}</p>
        </div>
      </div>
    </div>
  );
}
