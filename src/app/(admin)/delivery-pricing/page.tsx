import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Delivery Pricing | Natura Care Limited",
    description: "Delivery Pricing at Natura Care",
};

const DynamicDeliveryPricing = dynamic(
  () => import("@/modules/delivery-pricing/admin/DeliveryPricing"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function  DeliveryPricingPage() {
  return <DynamicDeliveryPricing />;
}
