import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "About | Natura Care Limited",
  description: "About Natura Care",
};

const DynamicAboutUsPage = dynamic(() => import("@/modules/about/public/AboutUs"), {
  loading: () => <LoadingPage />,
});

export default function AboutUsPage() {
  return <DynamicAboutUsPage />;
}
