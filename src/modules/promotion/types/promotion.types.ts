import { ICategory } from "@/modules/category/types/category.types";
import { IProduct } from "@/modules/product/types/product.types";

export type PromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "ARCHIVED";

export type PromotionDiscountType =
  | "PERCENTAGE"
  | "FIXED"
  | "CAP_LIMIT"
  | "SHIPPING";

export interface IPromotion {
  id: number;
  sid: string;
  title?: string | null;
  description?: string | null;
  couponCode: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null;
  usedCount: number;
  minPurchase?: number | null;
  maxPurchase?: number | null;
  maxDiscountAmount?: number | null;
  status: PromotionStatus;
  isPublic: boolean;
  isUpcoming?: boolean; //? true while the start date is still ahead
  createdAt: Date;
  updatedAt: Date;
  //? Admin view only
  createdById?: number | null;
  createdByName?: string | null;
  createdByRole?: string | null;
  updatedById?: number | null;
  updatedByName?: string | null;
  updatedByRole?: string | null;
  promotionProducts?: PromotionProduct[];
  promotionCategories?: PromotionCategory[];
}

export interface PromotionProduct {
  id: number;
  promotionId: number;
  productId: number;
  promotion?: IPromotion;
  product?: IProduct;
}

export interface PromotionCategory {
  id: number;
  promotionId: number;
  categoryId: number;
  // Relations
  promotion?: IPromotion;
  category?: ICategory;
}
