import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Free Delivery | Natura Care Limited",
  description: "Free Delivery Settings at Natura Care",
};

const DynamicFreeDeliverySettings = dynamic(
  () => import("@/modules/free-delivery/admin/FreeDeliverySettings"),
  {
    loading: () => <LoadingPage />,
  },
);
export default function FreeDeliverySettingsPage() {
  return <DynamicFreeDeliverySettings />;
}
