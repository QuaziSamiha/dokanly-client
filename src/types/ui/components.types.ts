import { ReactNode } from "react";

// ================== Expendable List ==================
export interface IExpendableListItem {
  title: string | ReactNode;
  content: ReactNode | string[];
}

export interface ICheckbox {
  id: number;
  name: string;
}

export interface IRadioButton {
  label: string;
  value: string;
}

// ================== Custom Tab ==================
export interface ITabList {
  label: string;
  value: string;
}

export interface ITabContent {
  value: string;
  content: ReactNode;
}

export interface ICustomTabProps {
  defaultTab?: string;
  tabList: ITabList[];
  tabContent: ITabContent[];
}

/** A tab in `<CustomTabGroupPrimary />`, which supports icons and counts. */
export interface ITabListPrimary extends ITabList {
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface ICustomTabGroupPrimary {
  tabList: ITabListPrimary[];
  /**
   * Omit to use the control as a standalone tab bar — the caller then renders
   * whatever the active tab should show. URL-driven listings need this, because
   * the content is one re-fetching view rather than a panel per tab.
   */
  tabContent?: ITabContent[];
  defaultTab?: string;
  /** Pass with `onValueChange` to drive the active tab from outside. */
  value?: string;
  onValueChange?: (value: string) => void;
  fullWidth?: boolean;
  /** Wrap triggers onto extra rows instead of scrolling the track sideways. */
  wrap?: boolean;
  rightSlot?: ReactNode;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

// ================== Product Card ==================
export interface IProductCard {
  id?: number;
  name: string;
  price: string;
  // originalPrice?: string;
  // discount?: string;
  imageUrl: string;
  // category?: string;
  onAddToCart?: () => void;
  // lowStockAlert?: number;
  // availability?: string;
  // totalStock?: number;
  // size?: string;
  // skinType?: string;
  // categoryTag?: string;
  slug: string;
}

// =================== Simple Card ===================

export interface ISimpleCard {
  id?: number;
  icon: string;
  title: string;
  subTitle?: string;
}

// ============ BREAD CRUMB ==========
export interface IBreadCrumbItem {
  label: string;
  link: string;
}

export interface IBreadCrumbProps {
  currentItem: string;
  previousItemLinks?: IBreadCrumbItem[];
}

// ========== TOOLTIP =============
export interface ICustomTooltip {
  action: string;
  content?: string;
}
