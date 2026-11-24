import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Media News | Natura Care Limited",
  description: "Media News at Natura Care",
};

const DynamicMediaNews = dynamic(
  () => import("@/modules/media-news/public/media-news/MediaNews"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function MediaNewsPage() {
  return <DynamicMediaNews />;
}
