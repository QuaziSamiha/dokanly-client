import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Natura Care Limited",
  description:
    "The terms that apply when you browse our store and place an order with Natura Care Limited.",
};

const DynamicTermConditions = dynamic(
  () => import("@/modules/support/public/TermConditions"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function TermConditionsPage() {
  return <DynamicTermConditions />;
}
