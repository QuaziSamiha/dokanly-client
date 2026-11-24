"use client";

import { useGet } from "@/hooks/api/useGet";
import { IHomeContent } from "@/modules/home/types/home-content.types";

// Define the structure of each section
interface IHomeSection {
  name: "promotionBar" | "heroSliders" | "ovc" | "productArticles" | "platformRedirects";
  data: IHomeContent[];
}

export function useHomeContent() {
  const {
    data: homeContentData,
    isLoading: isHomeContentLoading,
    refetch: homeContentRefetch,
  } = useGet<IHomeSection[]>(
    `/home-content/display-data`,
    [`getHomeContentDisplay`],
    undefined,
    undefined,
  );

  // Helper to safely extract the data array for a specific section
  const getSectionData = (name: string): IHomeContent[] => {
    return Array.isArray(homeContentData)
      ? homeContentData.find((section) => section.name === name)?.data || []
      : [];
  };

  // 1. Create the four specific arrays
  const promotionBar = getSectionData("promotionBar");
  const heroSliders = getSectionData("heroSliders");
  const ovc = getSectionData("ovc");
  const productArticles = getSectionData("productArticles");
  const platformRedirects = getSectionData("platformRedirects");

  return {
    // Individual arrays for direct use
    promotionBar,
    heroSliders,
    ovc,
    productArticles,
    platformRedirects,
    // Original data and states
    homeContentData,
    isHomeContentLoading,
    homeContentRefetch,
  };
}