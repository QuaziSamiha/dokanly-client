/**
 * Publication state of a media & news entry. Only PUBLISHED entries are served
 * to the public storefront.
 */
export type MediaNewsStatus = "PUBLISHED" | "INACTIVE" | "ARCHIVED";

/** Which carousel on the public page an entry is grouped under. */
export type MediaNewsCategory = "MEDIA" | "NEWS" | "COMMERCIAL";

/** Admin user embedded on a media & news row's audit trail. */
export interface IMediaNewsAuditUser {
  id: number;
  name: string;
  phone: string;
  email: string;
}

/**
 * CORE MEDIA & NEWS INTERFACE
 * Representing one Natura Care media, news or commercial entry.
 */
export interface IMediaNews {
  id: string;
  sid: string;
  status: MediaNewsStatus;
  category: MediaNewsCategory;

  // Primary content
  title: string;
  slug: string;
  description: string;

  // Attachments — an entry needs at least one of these or a source link.
  sourceUrls?: string[];
  mediaUrl?: string;
  videoUrl?: string;

  // Audit trail
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: IMediaNewsAuditUser;
  updatedBy?: IMediaNewsAuditUser;
}

/**
 * Trimmed row returned by the `categorized` endpoint — the public carousels
 * only need enough to render a card and link to the details page.
 */
export interface ICategorizedMediaNewsItem {
  id: number;
  sid: string;
  title: string;
  slug: string;
  description: string;
  mediaUrl?: string;
  createdAt: string;
}

/** The public page's three carousels, already grouped by the server. */
export interface ICategorizedMediaNews {
  media: ICategorizedMediaNewsItem[];
  news: ICategorizedMediaNewsItem[];
  commercial: ICategorizedMediaNewsItem[];
}

/** Shape of a `<SingleSelectSearch />` option used by the media & news forms. */
export interface IMediaNewsOption {
  id: string;
  name: string;
}
