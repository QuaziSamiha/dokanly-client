import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Profile | Natura Care Limited",
  description: "Manage your profile at Natura Care",
};

const DynamicAdminProfile = dynamic(
  () => import("@/modules/user/admin/profile/Profile"),
  {
    loading: () => <LoadingPage />,
  },
);

export default function AdminProfilePage() {
  return <DynamicAdminProfile />;
}
