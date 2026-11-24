import LoadingPage from "@/components/feedback/loading/LoadingPage";
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Natura Care Limited Bangladesh",
  description:
    "Natura Care Limited is a personal care company dedicated to creating effective solutions powered by natural ingredients. Discover our premium hair care and skin care products designed for modern consumers in Bangladesh. Quality, affordable, and accessible personal care solutions.",
  keywords: [
    "Natura Care Limited",
    "natural personal care Bangladesh",
    "hair care products Bangladesh",
    "skin care products Bangladesh",
    "natural beauty products",
    "personal care solutions",
    "Padma Group Bangladesh",
    "FMCG Bangladesh",
    "natural ingredients beauty",
    "affordable personal care",
    "quality beauty products",
    "modern consumers Bangladesh",
  ],
  openGraph: {
    title: "Natura Care Limited - Natural Personal Care Products Bangladesh",
    description:
      "Creating effective personal care solutions powered by natural ingredients. Premium hair care and skin care products for modern consumers seeking quality and value.",
    type: "website",
    locale: "en_BD",
    url: "https://naturacarebd.com",
    siteName: "Natura Care Limited",
    images: [
      {
        url: "/images/brand/logo-hero-og.png",
        width: 1200,
        height: 630,
        alt: "Natura Care Limited - Natural Personal Care Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Natura Care Limited - Natural Personal Care Products Bangladesh",
    description:
      "Creating effective personal care solutions powered by natural ingredients. Premium hair care and skin care products for modern consumers.",
    images: ["/images/brand/logo-hero-og.png"],
  },
  alternates: {
    canonical: "/",
  },
};

const DynamicHomePage = dynamic(() => import("@/modules/home/public/Home"), {
  loading: () => <LoadingPage />,
});

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Natura Care Limited",
            description:
              "Natura Care Limited is a personal care company dedicated to creating effective solutions powered by natural ingredients. We are committed to redefining the personal care landscape of Bangladesh and beyond.",
            url: "https://naturacarebd.com",
            logo: "https://naturacarebd.com/images/brand/logo.png",
            image: "https://naturacarebd.com/images/brand/logo-hero-og.png",
            foundingDate: "2024",
            founder: {
              "@type": "Organization",
              name: "Padma Group of Converters (PGC)",
            },
            parentOrganization: {
              "@type": "Organization",
              name: "Padma Group of Converters (PGC)",
              description: "A leading conglomerate in packaging and converting",
            },
            address: {
              "@type": "PostalAddress",
              addressCountry: "BD",
              addressRegion: "Bangladesh",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["English", "Bengali"],
            },
            sameAs: ["https://naturacarebd.com"],
            makesOffer: {
              "@type": "Offer",
              itemOffered: [
                {
                  "@type": "Product",
                  name: "Hair Care Products",
                  description: "Natural hair care solutions",
                },
                {
                  "@type": "Product",
                  name: "Skin Care Products",
                  description: "Natural skin care solutions",
                },
              ],
            },
            areaServed: {
              "@type": "Country",
              name: "Bangladesh",
            },
          }),
        }}
      />

      {/* Website Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Natura Care Limited",
            description:
              "Natural personal care products including hair care and skin care solutions for Bangladesh consumers",
            url: "https://naturacarebd.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://naturacarebd.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "Natura Care Limited",
              logo: {
                "@type": "ImageObject",
                url: "https://naturacarebd.com/images/brand/logo.png",
              },
            },
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://naturacarebd.com",
              },
            ],
          }),
        }}
      />

      <DynamicHomePage />
    </>
  );
}
