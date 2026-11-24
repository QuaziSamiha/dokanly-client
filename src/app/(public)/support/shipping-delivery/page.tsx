import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Shipping & Delivery | Natura Care Limited",
  description:
    "Order processing times, delivery timelines, shipping charges, tracking and delivery requirements at Natura Care Limited.",
};

const DynamicShippingDelivery = dynamic(
  () => import("@/modules/support/public/ShippingDelivery"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function ShippingDeliveryPage() {
  return <DynamicShippingDelivery />;
}
