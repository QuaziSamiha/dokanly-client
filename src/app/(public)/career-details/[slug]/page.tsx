import LoadingPage from "@/components/feedback/loading/LoadingPage";
import { toJsonLd } from "@/modules/blog/utils/blog-seo.server";
import {
  fetchOpenJob,
  jobDescription,
  jobPostingJsonLd,
} from "@/modules/career/utils/career-seo.server";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

const SITE_URL = "https://naturacarebd.com";

const FALLBACK_METADATA: Metadata = {
  title: "Career Details | Natura Care Limited",
  description: "Open positions at Natura Care.",
};

interface ICareerDetailsPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-job <head>: title, description, canonical URL and the social-share card.
 * A closed or unknown job (or an API outage) gets the generic metadata and is
 * kept out of the index, so a "no longer open" screen is never indexed.
 */
export async function generateMetadata({
  params,
}: ICareerDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchOpenJob(slug);

  if (!job) {
    return { ...FALLBACK_METADATA, robots: { index: false, follow: true } };
  }

  const title = `${job.position} | Careers at Natura Care`;
  const description = jobDescription(job);
  const canonical = `/career-details/${job.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
    twitter: { card: "summary", title, description },
  };
}

const DynamicCareerDetails = dynamic(
  () => import("@/modules/career/public/career-details/CareerDetails"),
  {
    loading: () => <LoadingPage />,
  },
);

export default async function CareerDetailsPage({
  params,
}: ICareerDetailsPageProps) {
  const { slug } = await params;
  // Same request as generateMetadata — Next dedupes it within one render.
  const job = await fetchOpenJob(slug);

  return (
    <>
      {job && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd(jobPostingJsonLd(job, SITE_URL)),
          }}
        />
      )}
      <DynamicCareerDetails />
    </>
  );
}
