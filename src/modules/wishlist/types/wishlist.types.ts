/** GET /wishlist: one saved product, as the wishlist card shows it. */
export interface IWishlistProduct {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  /** null when there is no discount */
  discountPrice: number | null;
  quantity: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  /** On sale and in stock right now */
  isAvailable: boolean;
  /** Comes in sizes: the size is chosen on the product page */
  hasSizes?: boolean;
  imageUrl: string | null;
}

export interface IWishlistItem {
  id: number;
  productId: number;
  createdAt: string;
  product: IWishlistProduct;
}
