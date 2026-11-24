import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Product | Natura Care Limited",
  description: "Edit Product at Natura Care",
};

const DynamicEditProduct = dynamic(
  () => import("@/modules/product/admin/product-form/EditProductPage"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function EditProductRoute() {
  return <DynamicEditProduct />;
}
