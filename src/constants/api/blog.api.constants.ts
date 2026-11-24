/**
 * Blog endpoints and react-query keys.
 *
 * `keys` holds the full query key arrays passed to `useGet` / `useGetAll`.
 * `rootKeys` holds the single key string that `useDelete` and
 * `invalidateQueries` expect.
 */
export const BLOG_API = {
  paths: {
    ALL: "/blog/all-blogs",
    PUBLISHED: "/blog/published",
    STATS: "/blog/stats",
    RELATED: (slug: string) => `/blog/related/${slug}`,
    BY_ID: (id: number | string) => `/blog/by-id/${id}`,
    BY_SLUG: (slug: string) => `/blog/${slug}`,
    CREATE: "/blog/create-blog",
    UPDATE_BY_ID: (id: number | string) => `/blog/update-blog/${id}`,
    ARCHIVE_BY_ID: (id: number | string) => `/blog/archive-blog/${id}`,
    DELETE_BY_ID: (id: number | string) => `/blog/delete-blog/${id}`,
  },
  keys: {
    ALL: ["getAllBlogs"] as string[],
    PUBLISHED: ["getPublishedBlogs"] as string[],
    STATS: ["getBlogStats"] as string[],
    RELATED: (slug: string): string[] => ["getRelatedBlogs", slug],
    DETAILS: (slug: string): string[] => ["getBlogDetails", slug],
  },
  rootKeys: {
    ALL: "getAllBlogs",
    PUBLISHED: "getPublishedBlogs",
  },
} as const;

/**
 * Blog type (the listing tabs) endpoints. Types belong to the blog domain, so
 * they live beside it rather than in a module of their own.
 */
export const BLOG_TYPE_API = {
  paths: {
    ALL: "/blog/types/all-blog-types",
    ACTIVE: "/blog/types/active",
    BY_ID: (id: number | string) => `/blog/types/${id}`,
    CREATE: "/blog/types/create-blog-type",
    UPDATE_BY_ID: (id: number | string) => `/blog/types/update-blog-type/${id}`,
    SET_DEFAULT_BY_ID: (id: number | string) => `/blog/types/set-default/${id}`,
    DELETE_BY_ID: (id: number | string) => `/blog/types/delete-blog-type/${id}`,
  },
  keys: {
    ALL: ["getAllBlogTypes"] as string[],
    ACTIVE: ["getActiveBlogTypes"] as string[],
  },
  rootKeys: {
    ALL: "getAllBlogTypes",
    ACTIVE: "getActiveBlogTypes",
  },
} as const;

/**
 * Blog comment endpoints.
 *
 * `CREATE` is public — the "Leave a Reply" form accepts guests as well as
 * logged-in users. Everything else is the admin moderation queue.
 */
export const BLOG_COMMENT_API = {
  paths: {
    ALL: "/blog/comments/all-comments",
    BY_BLOG_SLUG: (slug: string) => `/blog/comments/by-blog/${slug}`,
    BY_ID: (id: number | string) => `/blog/comments/${id}`,
    CREATE: (slug: string) => `/blog/comments/${slug}`,
    MODERATE_BY_ID: (id: number | string) => `/blog/comments/moderate/${id}`,
    PIN_BY_ID: (id: number | string) => `/blog/comments/pin/${id}`,
    DELETE_BY_ID: (id: number | string) =>
      `/blog/comments/delete-comment/${id}`,
  },
  keys: {
    ALL: ["getAllBlogComments"] as string[],
    BY_BLOG_SLUG: (slug: string): string[] => ["getBlogComments", slug],
  },
  rootKeys: {
    ALL: "getAllBlogComments",
    BY_BLOG_SLUG: "getBlogComments",
  },
} as const;
