import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React from "react";

const DynamicAccountOverview = dynamic(
  () => import("@/modules/account/customer/AccountOverview"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "My Account | Natura Care Limited" };

export default function MyAccountPage() {
  return <DynamicAccountOverview />;
}
