import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Cart | Natura Care Limited",
    description: "Cart at Natura Care",
};

const DynamicMyCart = dynamic(() => import("@/modules/cart/public/MyCart"), {
  loading: () => <LoadingPage />,
});

export default function MyCartPage() {
  return <DynamicMyCart />;
}
