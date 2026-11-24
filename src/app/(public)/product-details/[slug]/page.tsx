import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Product Details | Natura Care Limited",
    description: "Product Details at Natura Care",
};

const DynamicProductDetails = dynamic(
  () => import("@/modules/product/public/product-details/ProductDetails"),
  {
    loading: () => <LoadingPage />,
  }
);

export default function ProductDetailsPage() {
  return <DynamicProductDetails />;
}
