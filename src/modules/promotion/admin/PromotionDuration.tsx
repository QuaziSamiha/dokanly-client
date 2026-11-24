import React from "react";

export default function PromotionDuration() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 w-full relative">
        <div>
          <label className="text-neutralPrimary-800 text-sm font-semibold md:pl-2">
            Total Duration
          </label>
        </div>

        <div className="flex items-center gap-2 border border-neutralPrimary-300 py-2.5 px-3 rounded-md w-full shadow-inputField disabled:cursor-not-allowed">
          {/* {IconComponent && <IconComponent className="h-4 w-4" />} */}
          <div className="outline-none font-normal text-neutralPrimary-700 placeholder:text-neutralPrimary-400 text-sm w-full cursor-not-allowed ">
            5 days
          </div>
        </div>
      </div>
    </div>
  );
}
