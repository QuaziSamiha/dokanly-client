export interface IAdmin {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface IHomeContent {
  id: number;
  sid: string;
  type: "PROMOTION_BAR" | "HERO_SLIDER" | "OVC" | "PRODUCT_ARTICLE" | "PLATFORM_REDIRECT";
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  title?: string;
  image?: string;
  videoUrl?: string;
  platformName?: string;
  redirectUrl?: string;
  platformType?: "FACEBOOK" | "YOUTUBE" | "INSTAGRAM" | "LINKEDIN";
  description?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: IAdmin;
  updatedBy?: IAdmin;
}

// export enum HomeContentType {
//   HERO_SLIDER,
//   OVC,
//   PRODUCT_ARTICLE,
//   PLATFORM_REDIRECT,
// }
