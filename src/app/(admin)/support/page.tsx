"use client"; // This is the key!

import dynamic from "next/dynamic";
import LoadingPage from "@/components/feedback/loading/LoadingPage";

// Dynamically import the actual Support content here
const DynamicSupport = dynamic(
  () => import("@/modules/support/admin/Support"),
  {
    ssr: false,
    loading: () => <LoadingPage />,
  },
);

export default function SupportClient() {
  return <DynamicSupport />;
}
