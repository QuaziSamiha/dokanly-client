import Hero from "@/components/layout/hero/Hero";
import React from "react";
import ContactForm from "./ContactForm";
import Map from "./Map";

export default function ContactUs() {
  return (
    <section className="w-full">
      <Hero heroHeading="Contact Us" />
      <main className="container mx-auto px-4 sm:px-6">
        <section className="flex flex-col items-center gap-10 py-12 md:gap-14 md:py-16 lg:py-20">
          <div className="flex flex-col gap-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-neutralPrimary-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              Contact Information
            </h1>
            <p className="font-normal text-sm lg:text-base text-neutralPrimary-800">
              We&apos;d love to hear from you! Whether you have a question about
              your order, need help choosing the right product, or want to share
              feedback — the Natura Care team is here to help. Have something
              specific in mind? Use the contact form below and we&apos;ll get
              back to you within 24–48 hours.
            </p>
          </div>
          <section className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
            <Map />
            <ContactForm />
          </section>
        </section>
      </main>
    </section>
  );
}
