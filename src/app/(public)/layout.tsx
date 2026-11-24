import type { Metadata } from "next";
import Footer from "@/components/layout/footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";
import PromotionBar from "@/components/layout/promo-bar/PromotionBar";

/**
 * Public route group.
 *
 * Storefront shell (promo bar, navbar, footer) shared by every public page.
 */
export const metadata: Metadata = {
  title: "Natura Care Limited",
  description:
    "Discover premium natural personal care products by Natura Care Limited. Quality hair care and skin care solutions powered by natural ingredients, designed for modern consumers in Bangladesh.",
  keywords: [
    "natural personal care Bangladesh",
    "hair care products",
    "skin care products",
    "natural beauty products Bangladesh",
    "personal care solutions",
    "Natura Care Limited",
    "Padma Group Bangladesh",
    "FMCG products",
    "natural ingredients beauty",
    "affordable personal care",
  ],
  openGraph: {
    title: "Natura Care Limited - Natural Personal Care Products Bangladesh",
    description:
      "Premium natural personal care products including hair care and skin care solutions. Quality, affordable, and accessible beauty products for modern consumers.",
    type: "website",
    locale: "en_BD",
    siteName: "Natura Care Limited",
  },
  twitter: {
    card: "summary_large_image",
    title: "Natura Care Limited - Natural Personal Care Products",
    description:
      "Premium natural personal care products including hair care and skin care solutions for Bangladesh consumers.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icons/favicon.png",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="top-0 fixed w-full z-[9999] bg-white">
        {/* ======= PROMOTIONAL BANNER ============ */}
        <PromotionBar />
        <Navbar />
      </div>
      <div className="flex-grow pt-24 bg-backgroundPrimary">{children}</div>
      <Footer />
    </div>
  );
}
