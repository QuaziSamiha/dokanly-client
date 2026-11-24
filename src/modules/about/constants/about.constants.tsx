import { IconType } from "react-icons/lib";

import { MdHistoryEdu } from "react-icons/md";
import { GoGoal } from "react-icons/go";
import { ReactNode } from "react";
import { FaBottleDroplet } from "react-icons/fa6";
import Link from "next/link";

export interface ICompanyOverview {
  title: string;
  IconComponent: IconType;
  description: string | ReactNode;
}

export const companyOverviewData: ICompanyOverview[] = [
  {
    title: "Our Story",
    IconComponent: MdHistoryEdu,
    description: <div className="flex flex-col gap-2">
      <p>Born from decades of expertise and a vision to redefine personal care in Bangladesh, Natura Care Limited began
        its journey in 2023. We set out to offer more than just products—we wanted to bring solutions that are truly
        relevant to the modern woman of today.</p>
      <p>
        Every product in our portfolio carries a special, distinctive ingredient carefully chosen for its unique benefits. This
        ensures that each variant offers a clear point of differentiation, making it easier for consumers to choose the right
        product for their needs.
      </p>
      <p>
        Our philosophy blends quality, affordability, and accessibility. With user-friendly SKUs, pocket-friendly pricing, and
        strong collaborations—including our association with US-based giant Shea Olein—we aim to create a wow factor
        in the personal care category.
      </p>
    </div>,
  },
  {
    title: "Our Mission",
    IconComponent: GoGoal,
    description: <div className="flex flex-col gap-2">
      <p className="font-bold">
        To empower consumers with high-quality, effective, and affordable personal care solutions that
        blend nature&apos;s goodness with scientific innovation.
      </p>
      <p>
        We are committed to creating products that not only nourish and protect, but also add
        confidence, convenience, and value to everyday life.
      </p>
    </div>,
  },
  {
    title: "Our Products",
    IconComponent: FaBottleDroplet,
    description: <div className="flex flex-col items-stretch gap-12 justify-between h-full">
      <div className="flex flex-col gap-2">
        <p>
          From nourishing hair oils to refreshing face washes and deeply hydrating body lotions,
          every product is carefully crafted to deliver visible results, a touch of nature, and lasting
          confidence.
        </p>
        <p>
          At Natura Care, we create personal care solutions that blend natural ingredients with
          advanced formulations, designed to meet the everyday needs of modern consumers.
          Our portfolio spans across Hair Care, Skin Care and Body Care, with products that are
          effective, affordable, and accessible.
        </p>
      </div>
      <Link href="/product">   <button className="font-semibold text-base text-neutralPrimary-700 border border-neutralPrimary-300 px-8 py-4 rounded-full w-fit cursor-pointer">Explore Our Products</button>
      </Link>
    </div>,
  },
];
