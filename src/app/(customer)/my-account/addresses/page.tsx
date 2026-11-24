import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React from "react";

const DynamicAddressBook = dynamic(
  () => import("@/modules/address/customer/AddressBook"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "Addresses | Natura Care Limited" };

export default function AddressesPage() {
  return <DynamicAddressBook />;
}
