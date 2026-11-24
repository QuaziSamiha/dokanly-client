import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React from "react";

const DynamicWishList = dynamic(
  () => import("@/modules/wishlist/customer/WishList"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = { title: "Wishlist | Natura Care Limited" };

export default function WishListPage() {
  return <DynamicWishList />;
}
