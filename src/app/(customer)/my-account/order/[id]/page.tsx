import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React from "react";

const DynamicOrderDetails = dynamic(
  () => import("@/modules/order/customer/OrderDetails"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "Order Details | Natura Care Limited" };

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  return <DynamicOrderDetails orderId={orderId} />;
}
