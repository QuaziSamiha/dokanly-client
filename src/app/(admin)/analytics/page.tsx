import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { GA_PROPERTY_ID } from "@/config/env.config";
import { Metadata } from "next";
import { connection } from "next/server";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Analytics | Natura Care Limited",
  description: "Google Analytics overview for Natura Care admin",
};

const AnalyticsPage = dynamic(
  () => import("@/modules/analytics/admin/AnalyticsPage"),
  { loading: () => <LoadingPage /> }
);

export default async function Analytics() {
  // * RENDER AT REQUEST TIME SO GA_PROPERTY_ID COMES FROM RUNTIME ENV, NOT THE (EMPTY) BUILD ENV
  await connection();
  return <AnalyticsPage propertyId={GA_PROPERTY_ID} />;
}
