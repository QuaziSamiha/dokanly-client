"use client";

import dynamic from "next/dynamic";
import LoadingPage from "@/components/feedback/loading/LoadingPage";

const DynamicMediaNews = dynamic(
  () => import("@/modules/media-news/admin/AdminMediaNews"),
  {
    ssr: false,
    loading: () => <LoadingPage />,
  },
);

export default function AdminMediaNewsPage() {
  return <DynamicMediaNews />;
}
