"use client";

import dynamic from "next/dynamic";
import LoadingPage from "@/components/feedback/loading/LoadingPage";

const BlogContent = dynamic(() => import("@/modules/blog/admin/Blog"), {
  ssr: false,
  loading: () => <LoadingPage />,
});

export default function BlogAdminClient() {
  return <BlogContent />;
}
