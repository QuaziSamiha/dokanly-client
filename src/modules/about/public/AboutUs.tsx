import Hero from "@/components/layout/hero/Hero";
import React from "react";
import About from "./About";
import CompanyOverview from "./CompanyOverview";
// import PartnerCompany from "./PartnerCompany";
import PurestCare from "./PurestCare";

export default function AboutUs() {
  return (
    <section className="w-full">
      <Hero heroHeading="About Us" />
      <main className="container mx-auto">
        <section className="flex flex-col gap-8 justify-center items-center pt-8 max-xl:px-4 mb-8">
          <About />
          <CompanyOverview />
        </section>
      </main>
      <PurestCare />
      {/* <main className="container mx-auto">
        <section className="flex flex-col gap-8 justify-center items-center pt-8 max-xl:px-4 mb-8">
          <PartnerCompany />
        </section>
      </main> */}
    </section>
  );
}
