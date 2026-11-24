import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Natura Care Limited",
  description:
    "When you can return a Natura Care product, how to request a return and how refunds are processed.",
};

const DynamicReturnsExchanges = dynamic(
  () => import("@/modules/support/public/ReturnsExchanges"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function ReturnsExchangesPage() {
  return <DynamicReturnsExchanges />;
}
