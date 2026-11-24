"use client";

import { MEDIA_NEWS_API } from "@/constants/api";
import { useGet } from "@/hooks/api/useGet";
import {
  ICategorizedMediaNews,
  IMediaNews,
} from "../types/media-news.types";

/** Published entries already grouped into the three storefront carousels. */
export function useCategorizedMediaNews() {
  const { data, isLoading } = useGet<ICategorizedMediaNews>(
    MEDIA_NEWS_API.paths.CATEGORIZED,
    MEDIA_NEWS_API.keys.CATEGORIZED,
  );

  return { categorizedMediaNews: data, isCategorizedMediaNewsLoading: isLoading };
}

export function usePublicMediaNewsDetails(slug?: string) {
  const { data, isLoading } = useGet<IMediaNews>(
    MEDIA_NEWS_API.paths.BY_SLUG(slug ?? ""),
    MEDIA_NEWS_API.keys.DETAILS(slug ?? ""),
    undefined,
    Boolean(slug),
  );

  return { mediaNews: data, isMediaNewsLoading: isLoading };
}
