import { IProduct } from "@/modules/product/types/product.types";

export interface ICartItem {
  id: number;
  sid: string;
  cartId: number;
  productId: number;
  product: IProduct;
  quantity: number;
  price: number;
  total: number; // quantity * price
  // Product details snapshot
  productName: string;
  imageUrl?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICart {
  id: number;
  sid: string;
  userId: number;
  totalItems: number;
  items: ICartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  
}


export interface ICartCard {
  itemId?: number;
  perItemQuantity: number;
  index: number;
  name: string;
  imageUrl: string;
  pricePerItem: number;
  discountPricePerItem?: number;
}
