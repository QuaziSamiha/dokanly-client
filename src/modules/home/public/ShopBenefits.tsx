import { shopBenefitsData } from "@/modules/home/constants/home.constants";
import React from "react";
import SimpleCard from "@/modules/home/public/SimpleCard";

export default function ShopBenefits() {
  // console.info("shop benefits", shopBenefitsData);
  return (
    <section className="grid grid-cols-2 lg:grid-cols-5 items-stretch md:mx-4 2xl:mx-0">
      {shopBenefitsData.map((benefit, index) => {
        const isLast =
          index === shopBenefitsData.length - 1 &&
          shopBenefitsData.length % 2 !== 0;
        return (
          <div
            key={benefit.id}
            className={`${
              isLast ? "max-lg:col-span-2 justify-self-center" : "lg:col-span-1"
            } w-full flex items-center justify-center`}
          >
            <SimpleCard
              icon={benefit.icon}
              title={benefit.title}
              // subTitle={benefit.subTitle ?? 'hi'}
            />
          </div>
        );
      })}
    </section>
  );
}
