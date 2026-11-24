import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Add Product | Natura Care Limited",
    description: "Add Product at Natura Care",
};

const DynamicAddProduct = dynamic(
  () => import("@/modules/product/admin/product-form/AddProduct"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function AddProductPage() {
  return <DynamicAddProduct />;
}
