import LoadingPage from "@/components/feedback/loading/LoadingPage";
import {
  fetchBlogSeo,
  toJsonLd,
} from "@/modules/blog/utils/blog-seo.server";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { permanentRedirect } from "next/navigation";
import React from "react";

const SITE_URL = "https://naturacarebd.com";

const FALLBACK_METADATA: Metadata = {
  title: "Blog Details | Natura Care Limited",
  description: "Read the latest from the Natura Care blog.",
};

interface IBlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-post <head>: title, description, canonical URL and the social-share
 * card. A post that is not published (or an API outage) gets the generic
 * metadata and is kept out of the index, so a "Post Not Found" screen is never
 * indexed as a real page.
 */
export async function generateMetadata({
  params,
}: IBlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await fetchBlogSeo(slug);

  if (!seo) {
    return { ...FALLBACK_METADATA, robots: { index: false, follow: true } };
  }

  const canonical = `/blog-details/${seo.slug}`;
  const images = seo.imageUrl
    ? [{ url: seo.imageUrl, alt: seo.imageAlt ?? seo.title }]
    : undefined;

  return {
    title: `${seo.title} | Natura Care Blog`,
    description: seo.description,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: seo.title,
      description: seo.description,
      images,
      publishedTime: seo.publishedAt,
      modifiedTime: seo.updatedAt,
      authors: seo.authorName ? [seo.authorName] : undefined,
      section: seo.section,
      tags: seo.tags,
    },
    twitter: {
      card: seo.imageUrl ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      images: seo.imageUrl ? [seo.imageUrl] : undefined,
    },
  };
}

const DynamicBlogDetails = dynamic(
  () => import("@/modules/blog/public/blog-details/BlogDetails"),
  {
    loading: () => <LoadingPage />,
  },
);

export default async function BlogDetailsPage({
  params,
}: IBlogDetailsPageProps) {
  const { slug } = await params;
  // Same request as generateMetadata — Next dedupes it within one render.
  const seo = await fetchBlogSeo(slug);

  // An old slug of a renamed post: send browsers and crawlers to the current
  // URL with a permanent (308) redirect so search rankings carry over.
  if (seo && seo.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/blog-details/${seo.slug}`);
  }

  return (
    <>
      {seo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: seo.title,
              description: seo.description,
              image: seo.imageUrl ? [seo.imageUrl] : undefined,
              datePublished: seo.publishedAt,
              dateModified: seo.updatedAt,
              author: seo.authorName
                ? { "@type": "Person", name: seo.authorName }
                : { "@type": "Organization", name: "Natura Care Limited" },
              publisher: {
                "@type": "Organization",
                name: "Natura Care Limited",
                logo: {
                  "@type": "ImageObject",
                  url: `${SITE_URL}/images/brand/logo.png`,
                },
              },
              mainEntityOfPage: `${SITE_URL}/blog-details/${seo.slug}`,
              articleSection: seo.section,
              keywords: seo.tags.length ? seo.tags.join(", ") : undefined,
            }),
          }}
        />
      )}
      <DynamicBlogDetails />
    </>
  );
}
