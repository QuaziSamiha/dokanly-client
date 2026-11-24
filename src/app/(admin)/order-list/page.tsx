import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Orders | Natura Care Limited",
    description: "Orders at Natura Care",
};

const DynamicOrderList = dynamic(
  () => import("@/modules/order/admin/OrderList"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function OrderListPage() {
  return <DynamicOrderList />;
}
