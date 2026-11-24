import { FileText, LucideIcon, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { SupportPolicyType } from "@/modules/support/types/support.types";

export interface ISupportPolicyMeta {
  type: SupportPolicyType;
  title: string;
  href: string;
  summary: string;
  // * Customer-facing intro shown under the heading on the public page.
  intro: string;
  icon: LucideIcon;
  iconTone: string;
}

// * Display order and storefront details for each policy page.
// * Titles match the headings customers see on the public pages.
export const SUPPORT_POLICIES: ISupportPolicyMeta[] = [
  {
    type: "TERMS_CONDITION",
    title: "Terms & Conditions",
    href: "/support/term-conditions",
    summary: "The rules customers agree to when they browse and order.",
    intro: "The terms that apply when you browse our store and place an order with Natura Care.",
    icon: FileText,
    iconTone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  {
    type: "SHIPPING_DELIVERY",
    title: "Shipping & Delivery",
    href: "/support/shipping-delivery",
    summary: "Processing times, delivery areas, charges and tracking.",
    intro: "How long orders take, where we deliver, what it costs and how to track your parcel.",
    icon: Truck,
    iconTone: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  {
    type: "RETURN_EXCHANGE",
    title: "Returns & Exchanges",
    href: "/support/returns-exchanges",
    summary: "When and how customers can return items or get a refund.",
    intro: "When you can return an item, how to request it and how refunds are paid.",
    icon: RefreshCcw,
    iconTone: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    type: "PRIVACY_POLICY",
    title: "Privacy & Security",
    href: "/support/privacy-security",
    summary: "What customer data is collected and how it is protected.",
    intro: "What personal information we collect, why we need it and how we keep it safe.",
    icon: ShieldCheck,
    iconTone: "bg-violet-50 text-violet-700 ring-violet-100",
  },
];

// * Below this many words a policy is treated as placeholder text.
export const POLICY_MIN_WORDS = 50;
