import { IMediaNewsOption } from "../types/media-news.types";

/** Publication state options for the admin add/edit forms. ARCHIVED is set by
 * the soft delete endpoint, so it is not offered here. */
export const MEDIA_NEWS_STATUS_OPTIONS: IMediaNewsOption[] = [
  {
    id: "PUBLISHED",
    name: "Published",
  },
  {
    id: "INACTIVE",
    name: "Inactive",
  },
];

/** Carousel grouping options — category is locked once an entry is created. */
export const MEDIA_NEWS_CATEGORY_OPTIONS: IMediaNewsOption[] = [
  {
    id: "MEDIA",
    name: "Media",
  },
  {
    id: "NEWS",
    name: "News",
  },
  {
    id: "COMMERCIAL",
    name: "Commercial",
  },
];
