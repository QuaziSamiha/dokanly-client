import HeroSlider from "@/modules/home/admin/hero-slider/HeroSlider";
import OVC from "@/modules/home/admin/ovc/OVC";
import PlatformRedirect from "@/modules/home/admin/platform-redirect/PlatformRedirect";
import ProductArticle from "@/modules/home/admin/product-article/ProductArticle";
import TopTitle from "@/modules/home/admin/top-title/TopTitle";
import { ITabContent, ITabList } from "@/types";
import {
  Clapperboard,
  GalleryHorizontalEnd,
  LucideIcon,
  Megaphone,
  Newspaper,
  Share2,
} from "lucide-react";
import { IHomeContent } from "@/modules/home/types/home-content.types";

export interface IHomeContentSection {
  value: string;
  label: string;
  type: IHomeContent["type"];
  icon: LucideIcon;
  /** How many ACTIVE items the storefront home page shows (see the server's HOME_PAGE_SECTIONS). */
  homeLimit: number;
  /** One line telling the admin where this content appears. */
  hint: string;
}

//* ONE SOURCE FOR THE HOME CONTENT TABS: ORDER, ICON, API TYPE AND THE HINT
//* SHOWN UNDER THE BAR. homeLimit MUST MATCH THE SERVER'S display-data LIMITS.
export const HOME_CONTENT_SECTIONS: IHomeContentSection[] = [
  {
    value: "promotionBar",
    label: "Top Title",
    type: "PROMOTION_BAR",
    icon: Megaphone,
    homeLimit: 1,
    hint: "The announcement strip at the very top of every storefront page.",
  },
  {
    value: "heroSlider",
    label: "Hero Slider",
    type: "HERO_SLIDER",
    icon: GalleryHorizontalEnd,
    homeLimit: 5,
    hint: "The large rotating banners at the top of the home page.",
  },
  {
    value: "ovc",
    label: "OVC",
    type: "OVC",
    icon: Clapperboard,
    homeLimit: 1,
    hint: "The online video commercial: one video, GIF or image on the home page.",
  },
  {
    value: "productArticles",
    label: "Product Articles",
    type: "PRODUCT_ARTICLE",
    icon: Newspaper,
    homeLimit: 3,
    hint: "Image and story blocks that introduce featured products.",
  },
  {
    value: "platformRedirect",
    label: "Platform Redirect",
    type: "PLATFORM_REDIRECT",
    icon: Share2,
    homeLimit: 4,
    hint: "Social media icons that link to the Natura Care pages.",
  },
];

export const DEFAULT_HOME_CONTENT_TAB = HOME_CONTENT_SECTIONS[0].value;

export const homeContentTabList: ITabList[] = HOME_CONTENT_SECTIONS.map(
  ({ label, value }) => ({ label, value }),
);

export const homeDashboardTabContent: ITabContent[] = [
  { value: "promotionBar", content: <TopTitle /> },
  { value: "heroSlider", content: <HeroSlider /> },
  { value: "ovc", content: <OVC /> },
  { value: "productArticles", content: <ProductArticle /> },
  { value: "platformRedirect", content: <PlatformRedirect /> },
];

export const homeContentStatus = [
  {
    id: "ACTIVE",
    name: "Active",
  },
  {
    id: "INACTIVE",
    name: "Inactive",
  },
];
