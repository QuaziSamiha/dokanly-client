import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Products | Natura Care Limited",
  description: "Products at Natura Care",
};

const DynamicProductPage = dynamic(
  () => import("@/modules/product/public/product/Product"),
  {
    loading: () => <LoadingPage />,
  }
);

export default function ProductPage() {
  return <DynamicProductPage />;
}
