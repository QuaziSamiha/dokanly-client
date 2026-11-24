import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
    title: "Users | Natura Care Limited",
    description: "Users at Natura Care",
};

const DynamicAllUsers = dynamic(
  () => import("@/modules/user/admin/AllUsers"),
  {
    loading: () => <LoadingPage />,
  }
);
export default function AllUserPage() {
  return <DynamicAllUsers />;
}
