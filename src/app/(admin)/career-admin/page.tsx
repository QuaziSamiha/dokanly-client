"use client"; // This is the key!

import dynamic from "next/dynamic";
import LoadingPage from "@/components/feedback/loading/LoadingPage";

// Dynamically import the actual Career content here
const CareerContent = dynamic(() => import("@/modules/career/admin/Career"), {
  ssr: false,
  loading: () => <LoadingPage />,
});

export default function CareerClient() {
  return <CareerContent />;
}
