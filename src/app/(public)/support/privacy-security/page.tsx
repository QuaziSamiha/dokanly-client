import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy & Security | Natura Care Limited",
  description:
    "How Natura Care Limited collects, uses and protects your personal information.",
};

const DynamicPrivacySecurity = dynamic(
  () => import("@/modules/support/public/PrivacySecurity"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function PrivacySecurityPage() {
  return <DynamicPrivacySecurity />;
}
