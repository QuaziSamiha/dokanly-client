import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Coupons | Natura Care Limited",
    description: "All promotions at Natura Care",
};

const DynamicAllPromotions = dynamic(() => import("@/modules/promotion/public/AllPromotions"), {
    loading: () => <LoadingPage />,
});

export default function AllPromotions() {
    return <DynamicAllPromotions />;
}
