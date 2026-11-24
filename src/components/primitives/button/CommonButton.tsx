import React from "react";
import { IconType } from "react-icons/lib";

export interface ICommonButtonProps {
  label: string;
  bgColor?: string;
  IconComponent?: IconType | undefined;
}
export default function CommonButton({
  label,
  bgColor = "bg-greenPrimary-500",
  IconComponent,
}: ICommonButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center gap-2 ${bgColor} text-neutralPrimary-50 font-semibold text-base rounded-lg w-full px-14 py-3 cursor-pointer`}
    >
      {IconComponent && <IconComponent className="text-neutralPrimary-50 w-6 h-6" />}{label}
    </button>
  );
}
