import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Category | Natura Care Limited",
    description: "Category at Natura Care",
};

const DynamicCategory = dynamic(
  () => import("@/modules/category/admin/Category"),
  {
    loading: () => <LoadingPage />,
  }
);

export default function CategoryPage() {
  return <DynamicCategory />;
}
