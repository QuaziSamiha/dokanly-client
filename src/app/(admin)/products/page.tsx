import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Products | Natura Care Limited",
    description: "Products at Natura Care",
};

const DynamicProducts = dynamic(
  () => import("@/modules/product/admin/Products"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function ProductsPage() {
  return <DynamicProducts />;
}
