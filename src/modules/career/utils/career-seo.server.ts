import { getBaseUrl } from "@/config/env.config";
import { ICareer, JobType } from "../types/career.types";
import { htmlToText } from "./career.utils";

/** How long a server-rendered job head / sitemap entry is reused before refetching. */
const CAREER_SEO_REVALIDATE_SECONDS = 300;

/**
 * An open job (ACTIVE, deadline not passed) for `generateMetadata` and JSON-LD.
 * Sent without a token, so the API only finds open jobs. Returns null for a
 * closed or unknown job, or when the API is unreachable, so the page falls back
 * to generic metadata instead of failing.
 */
export async function fetchOpenJob(slug: string): Promise<ICareer | null> {
  try {
    const res = await fetch(
      `${getBaseUrl()}/job/${encodeURIComponent(slug)}`,
      { next: { revalidate: CAREER_SEO_REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data as ICareer) ?? null;
  } catch {
    return null;
  }
}

/** Every open job, for the sitemap. An unreachable API yields an empty list. */
export async function fetchOpenJobsForSitemap(): Promise<ICareer[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/job/active-current-jobs`, {
      next: { revalidate: CAREER_SEO_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.data) ? (body.data as ICareer[]) : [];
  } catch {
    return [];
  }
}

/** One or two sentences for the meta description. */
export function jobDescription(job: ICareer): string {
  const text = htmlToText(job.jobOverview) || htmlToText(job.jobResponsibilities);
  const intro = `${job.position} at Natura Care, ${job.jobLocation}.`;
  const full = text ? `${intro} ${text}` : intro;
  return full.length > 160 ? `${full.slice(0, 157).trimEnd()}…` : full;
}

const EMPLOYMENT_TYPE: Record<JobType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
};

/**
 * schema.org JobPosting, so the job can appear in Google's job search.
 * https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
export function jobPostingJsonLd(job: ICareer, siteUrl: string) {
  const description = [
    job.jobOverview,
    job.jobResponsibilities && `<h3>Responsibilities</h3>${job.jobResponsibilities}`,
    job.jobRequirements && `<h3>Requirements</h3>${job.jobRequirements}`,
    job.jobFacilities && `<h3>Benefits</h3>${job.jobFacilities}`,
  ]
    .filter(Boolean)
    .join("");

  const isRemote = job.jobLocationType === "ONLINE";

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.position,
    description,
    identifier: { "@type": "PropertyValue", name: "Natura Care Limited", value: job.slug },
    datePosted: job.createdAt,
    // * The deadline day is open until it ends.
    validThrough: job.deadline.replace(/T00:00:00(\.000)?Z$/, "T23:59:59Z"),
    employmentType: EMPLOYMENT_TYPE[job.jobType],
    hiringOrganization: {
      "@type": "Organization",
      name: "Natura Care Limited",
      sameAs: siteUrl,
      logo: `${siteUrl}/images/brand/logo.png`,
    },
    ...(isRemote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: { "@type": "Country", name: "Bangladesh" },
        }
      : {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.jobLocation,
              addressCountry: "BD",
            },
          },
        }),
    directApply: true,
    url: `${siteUrl}/career-details/${job.slug}`,
  };
}
