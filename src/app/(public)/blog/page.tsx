import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Blog | Natura Care Limited",
  description:
    "Tips, hair care, natural skincare and wellness stories from Natura Care.",
};

const DynamicBlogPage = dynamic(
  () => import("@/modules/blog/public/blog/Blog"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function BlogPage() {
  return <DynamicBlogPage />;
}
