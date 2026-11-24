import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const DynamicOrder = dynamic(
  () => import("@/modules/order/customer/Order"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "My Orders | Natura Care Limited" };

export default function OrderPage() {
  //* ==== THE LIST READS ITS TAB AND PAGE FROM THE URL (useSearchParams) ====
  return (
    <Suspense fallback={<LoadingPage />}>
      <DynamicOrder />
    </Suspense>
  );
}
