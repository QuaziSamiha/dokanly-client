/**
 * Publication lifecycle of a blog post. Only PUBLISHED posts are served to the
 * public storefront.
 */
export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** Lifecycle of a blog type — mirrors the shared `Status` enum on the API. */
export type BlogTypeStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

/**
 * Moderation state of a visitor comment. Only APPROVED comments appear in the
 * public thread and count toward `IBlog.totalComments`.
 */
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";

/** Admin user embedded on a blog row's audit trail. */
export interface IBlogAuditUser {
  id: number;
  name: string;
  email: string;
}

/**
 * A blog type — one of the filter tabs on the listing page
 * ("Tips & Tricks", "Hair Care", "Natural Skincare", "Wellness & Lifestyle").
 *
 * Exactly one type carries `isDefault`: it is the fallback for posts created
 * without a type, and the API refuses to delete or deactivate it.
 */
export interface IBlogType {
  id: number;
  sid: string;
  name: string;
  slug: string;
  description?: string;
  status: BlogTypeStatus;
  isDefault: boolean;
  isSystem: boolean;
  sortOrder?: number;

  /** Only returned on the admin list — the number of posts under this type. */
  blogCount?: number;

  createdAt: string;
  updatedAt: string;
  createdBy?: IBlogAuditUser;
  updatedBy?: IBlogAuditUser;
}

/**
 * A blog post as returned by the listing endpoints. `content` is deliberately
 * absent — the API omits it from list payloads to keep them small.
 */
export interface IBlogListItem {
  id: number;
  sid: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: BlogStatus;
  featured: boolean;
  bannerUrl?: string;
  /** Cover image alt text; render `bannerAlt || title`. */
  bannerAlt?: string;
  readTime?: number;
  viewCount: number;
  totalComments: number;
  /** Admin list only — comments on the post awaiting moderation. */
  pendingComments?: number;
  tags: string[];
  authorName?: string;
  type?: IBlogType;
  createdAt: string;
  publishedAt?: string;
  /** Last editorial change — views and comments do not move it. */
  updatedAt: string;
}

/**
 * CORE BLOG INTERFACE
 * A full Natura Care blog post, as returned by the detail and admin endpoints.
 */
export interface IBlog extends IBlogListItem {
  content: string;
  videoUrl?: string;
  allowComments: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  author?: IBlogAuditUser;
  createdBy?: IBlogAuditUser;
  updatedBy?: IBlogAuditUser;
}

/**
 * A comment on a blog post.
 *
 * `email`, `ipAddress` and `moderatorNotes` are personal/administrative data —
 * the API only serialises them on the admin routes, so they are optional here.
 */
export interface IBlogComment {
  id: number;
  sid: string;
  content: string;
  status: CommentStatus;

  /** Member name, or the name a guest typed into the reply form. */
  authorName: string;
  website?: string;
  isMember: boolean;
  isPinned: boolean;
  parentId?: number;
  createdAt: string;
  approvedAt?: string;
  replies?: IBlogComment[];

  // ===== ADMIN-ONLY FIELDS =====
  email?: string;
  ipAddress?: string;
  moderatorNotes?: string;
  blog?: { id: number; title: string; slug: string };
  user?: IBlogAuditUser;
  approvedBy?: IBlogAuditUser;
}

/**
 * What the post page needs for its <head>, from GET /blog/seo/:slug.
 * `slug` is the current one, which may differ from an old slug in the URL.
 */
export interface IBlogSeo {
  slug: string;
  title: string;
  description?: string;
  keywords: string[];
  imageUrl?: string;
  imageAlt?: string;
  authorName?: string;
  section?: string;
  tags: string[];
  publishedAt?: string;
  updatedAt: string;
}

/** Counters shown on the admin blog dashboard. */
export interface IBlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  pendingComments: number;
  approvedComments: number;
}

/** Shape of a `<SingleSelectSearch />` option used by the blog forms. */
export interface IBlogOption {
  id: string;
  name: string;
}
