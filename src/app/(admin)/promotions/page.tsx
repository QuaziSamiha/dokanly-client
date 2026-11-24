import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Promotions | Natura Care Limited",
    description: "Promotions at Natura Care",
};

const DynamicPromotions = dynamic(
  () => import("@/modules/promotion/admin/Promotions"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function PromotionsPage() {
  return <DynamicPromotions />;
}
