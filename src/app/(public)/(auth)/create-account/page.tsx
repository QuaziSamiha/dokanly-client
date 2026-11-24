import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import React from "react";

const DynamicCreateAccount = dynamic(
  () => import("@/modules/auth/public/create-account/CreateAccount"),
  {
    loading: () => <LoadingPage />,
  }
);

export const metadata = {
  title: "Create Account | Natura Care",
  description: "Create Account for Natura Care.",
  robots: {
    index: false, // don’t let Google index admin panel
    follow: false,
  },
};

export default function CreateAccountPage() {
  return <DynamicCreateAccount />;
}

// register | sign up | create account
