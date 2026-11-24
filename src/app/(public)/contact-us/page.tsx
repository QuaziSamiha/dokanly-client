import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Contact Us | Natura Care Limited",
    description: "Contact Us at Natura Care",
};

const DynamicContactUs = dynamic(() => import("@/modules/contact/public/ContactUs"), {
  loading: () => <LoadingPage />,
});
export default function ContactUsPage() {
  return <DynamicContactUs />;
}
