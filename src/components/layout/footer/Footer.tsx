import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";
import { BiLogoInstagramAlt, BiLogoLinkedin } from "react-icons/bi";
import { CgFacebook } from "react-icons/cg";
import { ImYoutube } from "react-icons/im";
import { MdOutlineEmail } from "react-icons/md";
import { RiPhoneLine } from "react-icons/ri";
import ExpendableList from "./ExpendableList";
import { IExpendableListItem } from "@/types";
import { MapPin } from "lucide-react";
import Link from "next/link";

const exploreItems = [
  {
    label: "All Products",
    link: "/product",
  },
  {
    label: "Hair Care",
    link: "/product?parentCategories=1",
  },
  {
    label: "Skin Care",
    link: "/product?parentCategories=2",
  },
  {
    label: "Body Care",
    link: "/product?parentCategories=3",
  },
  {
    label: "New Products",
    link: "/product?parentCategories=4",
  },
];

const company = [
  {
    label: "About",
    link: "/about-us",
  },
  {
    label: "Contact us",
    link: "/contact-us",
  },
  {
    label: "Photo & Media",
    link: "/media-news",
  },
];

const allSupports = [
  {
    label: "Terms & Conditions",
    link: "/support/term-conditions",
  },
  {
    label: "Shipping & Delivery",
    link: "/support/shipping-delivery",
  },
  {
    label: "Returns & Exchanges",
    link: "/support/returns-exchanges",
  },
  {
    label: "Privacy & Security",
    link: "/support/privacy-security",
  },
];

const headingClass =
  "text-sm font-semibold uppercase tracking-[0.12em] text-neutralPrimary-900";

const linkClass =
  "w-fit text-[15px] leading-6 font-normal text-neutralPrimary-600 transition-colors duration-200 hover:text-greenPrimary-600 focus-visible:text-greenPrimary-600 focus-visible:outline-none";

const renderLinks = (items: { label: string; link: string }[]) => (
  <ul className="flex flex-col gap-3">
    {items.map((item, index) => (
      <li key={index}>
        <Link href={item.link} className={linkClass}>
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
);

const topics: IExpendableListItem[] = [
  {
    title: <p className={headingClass}>Explore</p>,
    content: renderLinks(exploreItems),
  },
  {
    title: <p className={headingClass}>Company</p>,
    content: renderLinks(company),
  },
  {
    title: <p className={headingClass}>Support</p>,
    content: renderLinks(allSupports),
  },
];

const socialLinks = [
  {
    icon: CgFacebook,
    label: "Facebook",
    link: "https://www.facebook.com/NaturaCareLtd",
  },
  {
    icon: BiLogoInstagramAlt,
    label: "Instagram",
    link: "https://www.instagram.com/naturacareltd/",
  },
  {
    icon: ImYoutube,
    label: "YouTube",
    link: "https://www.youtube.com/@NaturaCareLimited",
  },
  {
    icon: BiLogoLinkedin,
    label: "LinkedIn",
    link: "https://www.linkedin.com/company/naturacareltd/",
  },
];

export default function Footer() {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <footer className="bg-greenPrimary-950 w-full px-4 sm:px-6">
      <main className="container mx-auto pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="flex flex-col gap-8 lg:gap-12">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:gap-8 xl:gap-12">
            <div className="lg:col-span-2 flex flex-col gap-5 lg:pr-6">
              <Image
                src="/images/brand/logo-footer.png"
                alt="Natura Care Limited"
                width={205}
                height={80}
                className="h-auto w-[130px] sm:w-[160px] lg:w-[180px]"
              />
              <p className="max-w-md text-[15px] leading-7 font-normal text-neutralPrimary-600">
                {/* Natural care products inspired by science and powered by nature.
                We are committed to sustainability, transparency, and your
                skin&apos;s well-being. */}
                Powered by the strength of natural ingredients, Natura Care
                Limited creates personal care solutions to make self-care
                simple, accessible, and confidence boosting for everyone, every
                day.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks?.map((socialLink, index) => (
                  <Link
                    key={index}
                    href={socialLink.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLink.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-greenPrimary-300/60 bg-white/60 text-greenPrimary-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-greenPrimary-500 hover:bg-greenPrimary-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40"
                  >
                    <socialLink.icon size={18} />
                  </Link>
                ))}
              </div>
            </div>

            {topics?.map((topic, index) => (
              <div key={index} className="flex flex-col gap-5 max-lg:hidden">
                {topic.title}
                {topic.content}
              </div>
            ))}

            <ExpendableList list={topics} classes="lg:hidden" />

            <div className="flex flex-col gap-5">
              <p className={headingClass}>Contact Us</p>
              <ul className="flex flex-col gap-4 text-[15px] leading-6 font-normal text-neutralPrimary-600">
                <li>
                  <a
                    href="mailto:info@naturacarebd.com"
                    className="group flex items-start gap-2.5 transition-colors duration-200 hover:text-greenPrimary-600"
                  >
                    <MdOutlineEmail
                      size={18}
                      className="mt-[3px] shrink-0 text-greenPrimary-500"
                    />
                    <span className="break-all">info@naturacarebd.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+8809644556677"
                    className="flex items-start gap-2.5 transition-colors duration-200 hover:text-greenPrimary-600"
                  >
                    <RiPhoneLine
                      size={18}
                      className="mt-[3px] shrink-0 text-greenPrimary-500"
                    />
                    <span>+8809644556677</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin
                    size={18}
                    className="mt-[3px] shrink-0 text-greenPrimary-500"
                  />
                  <address className="not-italic">
                    Padma Center 32/1, Dilu Road, New Eskaton,
                    <br />
                    Dhaka-1000, Bangladesh
                  </address>
                </li>
              </ul>
            </div>
          </section>

          <Separator className="bg-greenPrimary-300/50 w-full" />

          <section className="flex flex-col-reverse items-center gap-3 text-center text-sm leading-6 lg:flex-row lg:justify-between lg:text-left">
            <p className="font-normal text-neutralPrimary-500">
              Copyright © {year} Natura Care Limited.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium">
              <p className="text-neutralPrimary-500 font-normal">
                All Rights Reserved
              </p>
              <span className="h-4 w-px bg-neutralPrimary-300"></span>
              <Link
                href="/support/term-conditions"
                className="text-greenPrimary-600 underline-offset-4 transition-colors duration-200 hover:text-greenPrimary-700 hover:underline"
              >
                Terms and Conditions
              </Link>
              <span className="h-4 w-px bg-neutralPrimary-300"></span>
              <Link
                href="/support/privacy-security"
                className="text-greenPrimary-600 underline-offset-4 transition-colors duration-200 hover:text-greenPrimary-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
          </section>
        </div>
      </main>
    </footer>
  );
}
