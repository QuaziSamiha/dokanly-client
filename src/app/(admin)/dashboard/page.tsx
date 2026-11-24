import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Dashboard | Natura Care Limited",
    description: "Dashboard at Natura Care",
};

const DynamicAdminDashboard = dynamic(
  () => import("@/modules/dashboard/admin/Dashboard"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function AdminDashboardPage() {
  return <DynamicAdminDashboard />;
}
