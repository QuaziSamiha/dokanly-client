import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Contact | Natura Care Limited",
  description: "Contact at Natura Care",
};

const DynamicContact = dynamic(
  () => import("@/modules/contact/admin/Contact"),
  {
    loading: () => <LoadingPage />,
  }
);

export default function ContactPage() {
  return <DynamicContact />;
}
