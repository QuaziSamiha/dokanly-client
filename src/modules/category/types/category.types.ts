export type CategoryStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface ICategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface ICategoryUserRef {
  id: number;
  name: string;
}

// Items of `children` and of GET /categories/tree. Admin-only fields are optional
// because the storefront receives the public node shape.
export interface ICategoryNode {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  isFeatured: boolean;
  showInMenu: boolean;
  status?: CategoryStatus;
  sortOrder?: number;
  productCount?: number;
  childrenCount?: number;
  children?: ICategoryNode[];
}

// PublicCategoryDto / AdminCategoryDto (see natura-care-server/docs/category.md).
// Admin-only fields are optional; the admin panel always receives them.
export interface ICategory {
  id: number;
  sid?: string;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  imageUrl: string | null;
  sortOrder?: number;
  isFeatured: boolean;
  showInMenu: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  parentId: number | null;
  parent: (ICategoryRef & { status?: CategoryStatus }) | null;
  path?: string;
  depth?: number;
  ancestors?: ICategoryRef[];
  children?: ICategoryNode[];
  productCount?: number;
  childrenCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: ICategoryUserRef | null;
  updatedBy?: ICategoryUserRef | null;
}

// GET /categories/active
export interface ICategoryOption {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  depth: number;
}
