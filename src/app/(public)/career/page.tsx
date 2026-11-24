import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Careers | Natura Care Limited",
  description:
    "Explore open positions at Natura Care and apply online. Full-time, part-time, contract and internship roles in Bangladesh.",
  alternates: { canonical: "/career" },
  openGraph: {
    type: "website",
    url: "/career",
    title: "Careers at Natura Care",
    description: "Explore open positions at Natura Care and apply online.",
  },
};

const DynamicCareerPage = dynamic(
  () => import("@/modules/career/public/career/Career"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function CareerPage() {
  return <DynamicCareerPage />;
}
