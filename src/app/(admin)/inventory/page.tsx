import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Inventory | Natura Care Limited",
  description: "Inventory at Natura Care",
};

const DynamicInventory = dynamic(
  () => import("@/modules/inventory/admin/Inventory"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function InventoryPage() {
  return <DynamicInventory />;
}
