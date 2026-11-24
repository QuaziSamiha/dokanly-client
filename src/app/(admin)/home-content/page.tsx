import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Home Content | Natura Care Limited",
    description: "Home Content at Natura Care",
};

const DynamicHomeContent = dynamic(
  () => import("@/modules/home/admin/HomeContent"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function  HomeContentPage() {
  return <DynamicHomeContent />;
}
