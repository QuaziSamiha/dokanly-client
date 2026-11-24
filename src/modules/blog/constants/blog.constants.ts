import { FileText, LucideIcon, Tags } from "lucide-react";
import { ITabList } from "@/types";
import { IBlogOption } from "../types/blog.types";

/**
 * Tabs across the top of the admin blog screen. Comments have no tab: they are
 * moderated per post, from the Comments column of the blog table.
 */
export const BLOG_TAB_LIST: (ITabList & { icon: LucideIcon })[] = [
  { label: "Blogs", value: "blogs", icon: FileText },
  { label: "Types", value: "types", icon: Tags },
];

export const DEFAULT_BLOG_TAB = BLOG_TAB_LIST[0].value;

/** Publication status options for the admin add/edit blog forms. */
export const BLOG_STATUS_OPTIONS: IBlogOption[] = [
  { id: "DRAFT", name: "Draft" },
  { id: "PUBLISHED", name: "Published" },
  { id: "ARCHIVED", name: "Archived" },
];

/** Lifecycle options for the blog type form. */
export const BLOG_TYPE_STATUS_OPTIONS: IBlogOption[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
  { id: "ARCHIVED", name: "Archived" },
];

/** Cover images are capped to match the API's `validateImageFile` rule. */
export const BLOG_BANNER_MAX_SIZE = 5 * 1024 * 1024;

/** Page size for the public blog listing grid — 9 fills three rows of three. */
export const PUBLIC_BLOG_PAGE_SIZE = 9;
