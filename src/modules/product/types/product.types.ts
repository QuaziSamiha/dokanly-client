import { ICategory } from "@/modules/category/types/category.types";

export interface IProductImage {
  id: number;
  sid: string;
  url: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: number;
  sid: string;
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  // ARCHIVED = deleted (soft): read-only, set only by DELETE /products/:id
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED"; //? PRODUCT STATUS, defaults to ACTIVE
  publishedAt: string | null; // first time the product went live
  type: "SIMPLE" | "VARIABLE" | "COMBO"; // defaults to SIMPLE
  featured: boolean;
  categoryId: number;
  categoryParentName?: string;
  category: ICategory;
  images: IProductImage[];
  price: number;
  discountPrice?: number; // ? CONSIDERED IT AS DISCOUNT PRICE
  costPrice?: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK"; // derived from quantity by the server
  size?: number | null; // pack size in grams or ml (190 = 190 g / 190 ml)
  dimensions?: Record<string, unknown>;
  seoTitle: string;
  seoDescription?: string;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
  categoryParentId: string;
  categorySlug?: string;
  // VARIABLE only: sizes in display order (public reads list active sizes
  // only). price / discountPrice / quantity above mirror the first size.
  variants: IProductVariant[];
  // COMBO only: what one combo contains. quantity above is how many complete
  // combos the items' stock allows.
  bundleItems: IProductBundleItem[];
  // Admin responses only
  createdByUser?: IProductUser;
  updatedByUser?: IProductUser;
}

export interface IProductVariant {
  id: number;
  size: string; // "100ml"
  price: number;
  discountPercent: number; // 0 = no discount
  discountPrice: number; // 0 = no discount
  quantity: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  sortOrder: number;
  // Admin responses only
  sid?: string;
  status?: "ACTIVE" | "INACTIVE";
  costPrice?: number;
  sku?: string | null;
}

export interface IProductBundleItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number; // units in one combo
  productName: string;
  productSlug: string | null; // null while that product is hidden from the shop
  size: string | null;
  imageUrl: string | null;
  // Admin responses only
  productStatus?: IProduct["status"];
  stock?: number;
  sizeStatus?: "ACTIVE" | "INACTIVE" | null;
}

// GET /products/bundle-options: what the combo form can pick.
export interface IBundleOption {
  id: number;
  name: string;
  type: "SIMPLE" | "VARIABLE";
  status: IProduct["status"];
  price: number;
  discountPrice: number;
  quantity: number;
  imageUrl: string | null;
  variants: {
    id: number;
    size: string;
    status: "ACTIVE" | "INACTIVE";
    price: number;
    discountPrice: number;
    quantity: number;
  }[];
}

export interface IProductUser {
  id: number;
  name: string;
  phone?: string | null;
  email?: string;
  role?: string;
}

export interface IProductCard {
  onAddToCart?: () => void;
  product: IProduct;
}

// * ============ FOR FILTERING ==========
// * ====== TYPE OF PRICE_RANGE, PRICE, CATEGORIES, SORT ORDER, PAGINATION, SEARCH ==========
export interface IProductFilterOptions {
  // Price filters
  priceRange?: TProductPriceRange;
  minPrice?: number;
  maxPrice?: number;
  parentCategoryIds?: number[];
  categoryIds?: number[];
  size?: TProductSize;
  // Search
  searchTerm?: string;
  // Sorting
  sortBy?: "price" | "name" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  // Pagination
  page?: number;
  limit?: number;
}

export type TProductPriceRange =
  | "under-100"
  | "100-199"
  | "200-299"
  | "300-plus";

export type TProductSize = "small" | "medium" | "large";

export interface IProductFilter {
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** GET /products/stats: counts behind the admin table's tabs and quick filters. */
export interface IProductStats {
  totalProducts: number;
  statusCounts: Record<IProduct["status"], number>;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  featured: number;
  notFeatured: number;
}

/** Filters of the admin product table, sent as GET /products query parameters. */
export interface IProductFilters {
  status?: IProduct["status"];
  type?: "SIMPLE" | "VARIABLE" | "COMBO";
  stockStatus?: IProduct["stockStatus"];
  featured?: "true" | "false";
  parentCategoryId?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "price" | "quantity";
}
