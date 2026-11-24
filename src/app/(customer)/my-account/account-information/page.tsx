import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React from "react";

const DynamicAccountInformation = dynamic(
  () => import("@/modules/user/customer/AccountInformation"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "Account Details | Natura Care Limited" };

export default function AccountInformationPage() {
  return <DynamicAccountInformation />;
}
