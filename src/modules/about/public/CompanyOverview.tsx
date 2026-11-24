import { companyOverviewData } from "@/modules/about/constants/about.constants";
import React from "react";

export default function CompanyOverview() {
  console.info(companyOverviewData);
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companyOverviewData?.map((data, index) => {
        const { title, IconComponent, description } = data;
        return (
          <div
            key={index}
            className="flex flex-col gap-6 py-4 px-6 border border-neutralPrimary-300 rounded-xl w-full"
          >
            <div className="flex items-center justify-between">
              <p className="text-greenPrimary-500 font-bold text-3xl">
                {title}
              </p>
              <IconComponent className="text-greenPrimary-500 w-10 h-8" />
            </div>
            <div className="text-neutralPrimary-800 text-sm font-normal leading-6 w-full">
              {description}
            </div>
          </div>
        );
      })}
    </section>
  );
}
