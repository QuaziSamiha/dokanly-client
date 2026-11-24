/**
 * Media & News endpoints and react-query keys.
 *
 * `keys` holds the full query key arrays passed to `useGet` / `useGetAll`.
 * `rootKeys` holds the single key string that `useDelete` and
 * `invalidateQueries` expect.
 */
export const MEDIA_NEWS_API = {
  paths: {
    ALL: "/media-news/all-media-news",
    CATEGORIZED: "/media-news/categorized",
    BY_SLUG: (slug: string) => `/media-news/${slug}`,
    CREATE: "/media-news/create-media-news",
    UPDATE_BY_ID: (id: number | string) => `/media-news/update-media-news/${id}`,
    SOFT_DELETE_BY_ID: (id: number | string) =>
      `/media-news/soft-delete-media-news/${id}`,
  },
  keys: {
    ALL: ["getAllMediaNews"] as string[],
    CATEGORIZED: ["getAllActiveCategorizedMediaNews"] as string[],
    DETAILS: (slug: string): string[] => ["getMediaNewsDetails", slug],
  },
  rootKeys: {
    ALL: "getAllMediaNews",
    CATEGORIZED: "getAllActiveCategorizedMediaNews",
  },
} as const;
