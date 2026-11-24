import { Metadata } from "next";
import { plusJakarta } from "@/lib/fonts";
import "./globals.css";
import React from "react";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import ConfirmProvider from "@/providers/ConfirmProvider";
import { GoogleTagManager } from "@next/third-parties/google";
import { getGtmId, isAnalyticsEnabled } from "@/config/gtm.config";
// import FacebookPixel from "@/components/layout/scripts/FacebookPixel"; // * LEGACY: direct Meta Pixel base script — superseded by GTM (Meta Pixel tag lives in the GTM container now)
// import { GoogleAnalytics } from "@next/third-parties/google"; // * LEGACY: direct GA4 — superseded by GTM (GA4 Configuration tag lives in the GTM container now)
// import { GA_MEASUREMENT_ID } from "@/config/env.config"; // * LEGACY: see above

export const metadata: Metadata = {
  title: {
    default:
      "Natura Care Limited - Natural Personal Care Products | Hair Care & Skin Care Bangladesh",
    template: "%s | Natura Care Limited",
  },
  description:
    "Natura Care Limited is a leading personal care company in Bangladesh, creating effective solutions powered by natural ingredients. Discover our premium hair care and skin care products designed for modern consumers seeking quality and value.",
  keywords: [
    "natural personal care",
    "hair care products Bangladesh",
    "skin care products Bangladesh",
    "natural beauty products",
    "personal care Bangladesh",
    "Natura Care Limited",
    "Padma Group",
    "FMCG Bangladesh",
    "natural ingredients",
    "affordable beauty products",
  ],
  authors: [{ name: "Natura Care Limited" }],
  creator: "Natura Care Limited",
  publisher: "Natura Care Limited",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://naturacarebd.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://naturacarebd.com",
    title: "Natura Care Limited - Natural Personal Care Products Bangladesh",
    description:
      "Premium natural personal care products including hair care and skin care solutions. Quality, affordable, and accessible beauty products for modern consumers in Bangladesh.",
    siteName: "Natura Care Limited",
    images: [
      {
        url: "/images/brand/logo.png",
        width: 1200,
        height: 630,
        alt: "Natura Care Limited - Natural Personal Care Products",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = getGtmId();
  // * LEGACY: const gaId = GA_MEASUREMENT_ID; — direct GA4 load, superseded by GTM's own GA4 Configuration tag
  return (
    <html lang="en">
      {isAnalyticsEnabled() && <GoogleTagManager gtmId={gtmId!} />}
      {/* LEGACY: {gaId && <GoogleAnalytics gaId={gaId} />} */}
      <body className={`${plusJakarta.className} antialiased`}>
        {isAnalyticsEnabled() && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <QueryProvider>
          <NextAuthProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </NextAuthProvider>
        </QueryProvider>
        <Toaster
          position="top-right"
          duration={2000}
          theme="light"
          richColors
          closeButton
          toastOptions={{ classNames: { info: "toast-info" } }}
        />
        {/* <FacebookPixel /> */}
      </body>
    </html>
  );
}
