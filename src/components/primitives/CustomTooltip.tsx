import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ICustomTooltip } from "@/types";
import React from "react";
import { BiSolidEdit } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { HiOutlineDownload } from "react-icons/hi";

export default function CustomTooltip({ action, content }: ICustomTooltip) {
  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            {action === "edit" && (
              <BiSolidEdit
                fontSize={24}
                className="text-neutralPrimary-500"
              />
            )}
            {action === "view" && (
              <IoEyeOutline
                fontSize={20}
                className="text-neutralPrimary-500"
              />
            )}
            {action === "delete" && (
              <MdDelete
                fontSize={24}
                className="text-neutralPrimary-500 hover:text-destructive-600"
              />
            )}
            {action === "download" && (
              <HiOutlineDownload
                fontSize={20}
                className="text-neutralPrimary-500"
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
