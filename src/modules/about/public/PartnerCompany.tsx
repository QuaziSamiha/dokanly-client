import Image from "next/image";
import React from "react";

export default function PartnerCompany() {
  return (
    <section className="grid grid-cols-3">
      <div className="">
        <Image
          src="/images/about/padma-group-logo.png"
          alt="partner"
          width={405}
          height={239}
        />
      </div>
      <div className="col-span-2">
        <div className="flex flex-col gap-6">
          <p className="text-4xl max-md:text-2xl font-bold text-textTeal">
            About Padma Group of Converters (PGC)
          </p>

          <div className="flex flex-col gap-8">
            <p className="text-textBlack leading-8">
              <span className="font-bold">Padma Group of Converters (PGC)</span>{" "}
              is a well-known behemoth in the packaging and converting industry
              in Bangladesh. Apart from leading the packaging industry, they
              have also been the WHITE LABEL manufacturer of choice in the
              country. Padma Group of Converters specializes in the production
              of various packaging solutions.
            </p>
            <p className="text-textBlack leading-8">
              The first company of the group,{" "}
              <span className="font-bold">Padma Cap Mfg. Co. Ltd</span> was
              established in 1987 at Barisal. Over the years, the company has
              established itself as a reliable and trusted provider of packaging
              solutions for various industries, including food and beverage,
              pharmaceuticals, personal care, home care and many others.
            </p>
            <p className="text-textBlack leading-8">
              Other than this, the company is experienced as a manufacturing
              partner in the form of contract manufacturing with different
              renowned Multinational and Local Brands. PGC is committed to
              delivering quality, reliability and value to its clients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
