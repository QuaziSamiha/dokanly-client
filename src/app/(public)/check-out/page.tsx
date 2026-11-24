import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Check Out | Natura Care Limited",
    description: "Check Out at Natura Care",
};

const DynamicCheckOut = dynamic(() => import("@/modules/checkout/public/CheckOut"), {
  loading: () => <LoadingPage />,
});
export default function CheckOutPage() {
  return <DynamicCheckOut />;
}
