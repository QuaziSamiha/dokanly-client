"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Globe2,
  MapPin,
  RefreshCw,
  SearchX,
  Wallet,
} from "lucide-react";
import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import Hero from "@/components/layout/hero/Hero";
import { truncateText } from "@/lib/utils/text.utils";
import ShareButtons from "@/modules/blog/public/blog-details/ShareButtons";
import {
  DeadlineBadge,
  JobTypeBadge,
  WorkModeBadge,
} from "../../components/CareerBadges";
import { usePublicCareerDetails } from "../../hooks/usePublicCareer";
import { ICareer } from "../../types/career.types";
import {
  deadlineLabel,
  formatDeadline,
  jobTypeLabel,
  postedLabel,
  salaryLabel,
  workModeLabel,
} from "../../utils/career.utils";
import CareerDetailsSkeleton from "./CareerDetailsSkeleton";
import CareerForm from "./CareerForm";

const scrollToForm = () =>
  document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function CareerDetails() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;

  const { career, isCareerLoading, isNotFound, isCareerError, refetchCareer } =
    usePublicCareerDetails(slug);

  return (
    <section className="w-full">
      <Hero
        heroHeading="Career Details"
        customBreadCrumb={
          <CustomBreadCrumb
            previousItemLinks={[{ label: "Career", link: "/career" }]}
            currentItem={truncateText(career?.position || "", 24) || "Career Details"}
          />
        }
      />

      {isCareerLoading ? (
        <CareerDetailsSkeleton />
      ) : career ? (
        <JobView job={career} />
      ) : (
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
            <span className="mb-1 rounded-full bg-neutralPrimary-100 p-4">
              {isCareerError ? (
                <RefreshCw className="h-9 w-9 text-neutralPrimary-400" aria-hidden />
              ) : (
                <SearchX className="h-9 w-9 text-neutralPrimary-400" aria-hidden />
              )}
            </span>
            <h1 className="text-2xl font-bold text-neutralPrimary-800">
              {isNotFound || !isCareerError
                ? "This position is no longer open"
                : "We couldn't load this job"}
            </h1>
            <p className="text-neutralPrimary-600">
              {isNotFound || !isCareerError
                ? "The deadline may have passed or the role has been filled. Take a look at our other openings."
                : "Please check your connection and try again."}
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              {isCareerError && (
                <button
                  type="button"
                  onClick={() => refetchCareer()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutralPrimary-300 px-6 font-semibold text-neutralPrimary-700 hover:border-greenPrimary-500 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              )}
              <Link
                href="/career"
                className="inline-flex h-11 items-center justify-center rounded-full bg-greenPrimary-500 px-6 font-semibold text-white hover:bg-greenPrimary-600"
              >
                View open positions
              </Link>
            </div>
          </div>
        </main>
      )}
    </section>
  );
}

function JobView({ job }: { job: ICareer }) {
  // * The mobile apply bar hides while the form (or the header CTA) is on screen.
  const formWatchRef = useRef<HTMLDivElement>(null);
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const node = formWatchRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setFormInView(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: "overview", title: "About the role", html: job.jobOverview },
    { id: "responsibilities", title: "What you'll do", html: job.jobResponsibilities },
    { id: "requirements", title: "What we're looking for", html: job.jobRequirements },
    { id: "benefits", title: "What we offer", html: job.jobFacilities },
  ].filter((section) => section.html?.trim());

  const summary = [
    { icon: Briefcase, label: "Job type", value: jobTypeLabel(job) },
    { icon: Globe2, label: "Work mode", value: workModeLabel(job) },
    { icon: MapPin, label: "Location", value: job.jobLocation },
    { icon: Wallet, label: "Salary", value: salaryLabel(job.salary) },
    {
      icon: CalendarClock,
      label: "Apply by",
      value: `${formatDeadline(job.deadline)} (${deadlineLabel(job.deadline).toLowerCase()})`,
    },
    { icon: CalendarDays, label: "Posted", value: postedLabel(job.createdAt).replace(/^Posted /, "") },
  ].filter((item) => item.value);

  return (
    <main className="container mx-auto px-4 pb-28 pt-6 lg:pb-16 lg:pt-10">
      <Link
        href="/career"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutralPrimary-600 hover:text-greenPrimary-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All open positions
      </Link>

      {/* ============ HEADER ============ */}
      <header className="flex flex-col gap-5 rounded-2xl bg-careerBg p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <JobTypeBadge job={job} />
            <WorkModeBadge job={job} />
            <DeadlineBadge deadline={job.deadline} />
          </div>
          <h1 className="text-2xl font-bold leading-tight text-neutralPrimary-800 sm:text-3xl lg:text-4xl">
            {job.position}
          </h1>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-neutralPrimary-600 sm:text-base">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-greenPrimary-500" aria-hidden />
              {job.jobLocation}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-greenPrimary-500" aria-hidden />
              {salaryLabel(job.salary)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-greenPrimary-500 px-8 font-semibold text-white shadow-sm transition-all hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 active:scale-[0.99] max-lg:hidden cursor-pointer"
        >
          Apply now
        </button>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        {/* ============ DESCRIPTION + FORM ============ */}
        <div className="flex min-w-0 flex-col gap-10">
          <article className="flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id} className="flex flex-col gap-3">
                <h2 id={section.id} className="text-xl font-bold text-neutralPrimary-800 sm:text-2xl">
                  {section.title}
                </h2>
                <div
                  className="rich-text-container break-words text-base leading-relaxed text-neutralPrimary-600 [&_li]:mb-1.5 [&_li]:pl-1 [&_strong]:text-neutralPrimary-800"
                  dangerouslySetInnerHTML={{ __html: section.html as string }}
                />
              </section>
            ))}
          </article>

          <div ref={formWatchRef}>
            <CareerForm position={job.position} jobId={job.id} />
          </div>
        </div>

        {/* ============ SUMMARY ============ */}
        <aside className="max-lg:order-first lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-2xl border border-neutralPrimary-300/70 bg-white p-5 shadow-neutral02 sm:p-6">
            <h2 className="text-lg font-bold text-neutralPrimary-800">Job summary</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {summary.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-neutralPrimary-500">
                      {label}
                    </dt>
                    <dd className="text-sm font-semibold text-neutralPrimary-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-greenPrimary-500 font-semibold text-white transition-all hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 max-lg:hidden cursor-pointer"
            >
              Apply now
            </button>
            <div className="flex flex-col gap-3 border-t border-neutralPrimary-100 pt-5">
              <p className="text-sm font-medium text-neutralPrimary-600">
                Know someone who&apos;d be a great fit?
              </p>
              <ShareButtons title={`${job.position} at Natura Care`} path={`/career-details/${job.slug}`} />
            </div>
          </div>
        </aside>
      </div>

      {/* ============ MOBILE APPLY BAR ============ */}
      <div
        aria-hidden={formInView}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutralPrimary-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 lg:hidden ${
          formInView ? "pointer-events-none translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutralPrimary-800">{job.position}</p>
            <p className="text-xs text-neutralPrimary-500">
              Apply by {formatDeadline(job.deadline)}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            tabIndex={formInView ? -1 : 0}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-greenPrimary-500 px-6 font-semibold text-white active:scale-[0.98] cursor-pointer"
          >
            Apply now
          </button>
        </div>
      </div>
    </main>
  );
}
