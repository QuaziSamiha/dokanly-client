import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Media News Details | Natura Care Limited",
  description: "Media News Details at Natura Care",
};

const DynamicMediaNewsDetails = dynamic(
  () =>
    import("@/modules/media-news/public/media-news-details/MediaNewsDetails"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function MediaNewsDetailsPage() {
  return <DynamicMediaNewsDetails />;
}
