import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

export const metadata: Metadata = {
  title: "Login | Natura Care Limited",
  description: "Login at Natura Care",
};

const DynamicLogin = dynamic(() => import("@/modules/auth/public/login/Login"), {
  loading: () => <LoadingPage />,
});

export default function LoginPage() {
  return <DynamicLogin />;
}
