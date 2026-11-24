"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  MailCheck,
  RefreshCw,
  Search,
  SearchX,
  X,
} from "lucide-react";
import Hero from "@/components/layout/hero/Hero";
import { fieldTrigger } from "@/components/form/formStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  JOB_LOCATION_TYPE_LABELS,
  JOB_TYPE_LABELS,
  RESUME_MAX_MB,
} from "../../constants/career.constants";
import { usePublicCareers } from "../../hooks/usePublicCareer";
import { ICareer, JobLocationType, JobType } from "../../types/career.types";
import { daysUntil } from "../../utils/career.utils";
import JobCard from "./JobCard";
import { JobSkeleton } from "./JobSkeleton";

type SortKey = "newest" | "closing";

const ALL = "ALL";

const HIRING_STEPS = [
  {
    icon: Search,
    title: "Find your role",
    text: "Read the responsibilities and requirements to see if the role fits you.",
  },
  {
    icon: FileText,
    title: "Send your application",
    text: `Fill in the short form and attach your resume (PDF, DOC or DOCX, up to ${RESUME_MAX_MB} MB).`,
  },
  {
    icon: MailCheck,
    title: "Hear from us",
    text: "We review every application and contact shortlisted candidates by phone or email.",
  },
];

const chipClass = (active: boolean) =>
  cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 cursor-pointer",
    active
      ? "border-greenPrimary-500 bg-greenPrimary-500 text-white"
      : "border-neutralPrimary-300 bg-white text-neutralPrimary-700 hover:border-greenPrimary-400 hover:text-greenPrimary-600",
  );

export default function Career() {
  const { jobs, isJobsLoading, isJobsError, refetchJobs } = usePublicCareers();

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<JobType | typeof ALL>(ALL);
  const [workMode, setWorkMode] = useState<JobLocationType | typeof ALL>(ALL);
  const [sort, setSort] = useState<SortKey>("newest");

  // * Only offer the filters that would return something.
  const typeCounts = useMemo(() => countBy(jobs, (job) => job.jobType), [jobs]);
  const modeCounts = useMemo(
    () => countBy(jobs, (job) => job.jobLocationType ?? undefined),
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        (jobType === ALL || job.jobType === jobType) &&
        (workMode === ALL || job.jobLocationType === workMode) &&
        (!term ||
          job.position.toLowerCase().includes(term) ||
          job.jobLocation.toLowerCase().includes(term)),
    );
    return sort === "closing"
      ? [...filtered].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
      : filtered;
  }, [jobs, search, jobType, workMode, sort]);

  const isFiltered = Boolean(search.trim()) || jobType !== ALL || workMode !== ALL;

  const clearFilters = () => {
    setSearch("");
    setJobType(ALL);
    setWorkMode(ALL);
  };

  return (
    <section className="w-full">
      <Hero heroHeading="Career" />

      <main className="container mx-auto flex flex-col gap-10 px-4 py-8 lg:gap-14 lg:py-14">
        {/* ============ INTRO ============ */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-greenPrimary-500">
              Careers at Natura Care
            </p>
            <h1 className="text-3xl font-bold leading-tight text-neutralPrimary-800 md:text-4xl">
              Build your career with Natura Care
            </h1>
            <p className="text-base leading-relaxed text-neutralPrimary-600">
              Browse our open positions and apply online in a few minutes. No
              account needed.
            </p>
          </div>
          {!isJobsLoading && !isJobsError && jobs.length > 0 && (
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-greenPrimary-950 px-4 py-2 text-sm font-semibold text-greenPrimary-700">
              <Briefcase className="h-4 w-4" aria-hidden />
              {jobs.length} open {jobs.length === 1 ? "position" : "positions"}
            </p>
          )}
        </header>

        {/* ============ OPENINGS ============ */}
        <section aria-labelledby="open-positions" className="flex flex-col gap-6">
          <h2 id="open-positions" className="sr-only">
            Open positions
          </h2>

          {jobs.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl bg-careerBg p-4 sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Search jobs</span>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutralPrimary-400"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by job title or location"
                    className="h-11 w-full rounded-lg border border-neutralPrimary-300 bg-white pl-10 pr-10 text-sm text-neutralPrimary-800 shadow-inputField placeholder:text-neutralPrimary-400 focus:border-greenPrimary-500 focus:outline-none focus:ring-4 focus:ring-greenPrimary-500/15 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutralPrimary-500 hover:bg-neutralPrimary-100 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3 md:flex">
                  <FilterSelect
                    label="Work mode"
                    value={workMode}
                    onChange={setWorkMode}
                    options={[
                      { value: ALL, label: "Any work mode" },
                      ...(Object.keys(JOB_LOCATION_TYPE_LABELS) as JobLocationType[])
                        .filter((mode) => modeCounts[mode])
                        .map((mode) => ({
                          value: mode,
                          label: `${JOB_LOCATION_TYPE_LABELS[mode]} (${modeCounts[mode]})`,
                        })),
                    ]}
                  />
                  <FilterSelect
                    label="Sort by"
                    value={sort}
                    onChange={setSort}
                    options={[
                      { value: "newest", label: "Newest first" },
                      { value: "closing", label: "Closing soonest" },
                    ]}
                  />
                </div>
              </div>

              <div
                role="group"
                aria-label="Filter by job type"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]"
              >
                <button
                  type="button"
                  aria-pressed={jobType === ALL}
                  onClick={() => setJobType(ALL)}
                  className={chipClass(jobType === ALL)}
                >
                  All jobs
                  <span className="opacity-75">{jobs.length}</span>
                </button>
                {(Object.keys(JOB_TYPE_LABELS) as JobType[])
                  .filter((type) => typeCounts[type])
                  .map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={jobType === type}
                      onClick={() => setJobType(type)}
                      className={chipClass(jobType === type)}
                    >
                      {JOB_TYPE_LABELS[type]}
                      <span className="opacity-75">{typeCounts[type]}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {isFiltered && (
            <div className="flex items-center justify-between gap-3 text-sm text-neutralPrimary-600" aria-live="polite">
              <p>
                Showing <span className="font-semibold">{visibleJobs.length}</span> of{" "}
                {jobs.length} positions
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-greenPrimary-600 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {isJobsLoading ? (
            <JobSkeleton />
          ) : isJobsError ? (
            <EmptyState
              icon={<RefreshCw className="h-9 w-9 text-neutralPrimary-400" />}
              title="We couldn't load the open positions"
              text="Please check your connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => refetchJobs()}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-greenPrimary-500 px-6 font-semibold text-white hover:bg-greenPrimary-600 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              }
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-9 w-9 text-neutralPrimary-400" />}
              title="No openings right now"
              text="We don't have any open positions at the moment. New roles are posted here first, so please check back soon."
              action={
                <Link
                  href="/contact-us"
                  className="inline-flex h-11 items-center rounded-full border border-greenPrimary-500 px-6 font-semibold text-greenPrimary-600 hover:bg-greenPrimary-500 hover:text-white"
                >
                  Contact us
                </Link>
              }
            />
          ) : visibleJobs.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-9 w-9 text-neutralPrimary-400" />}
              title="No jobs match your filters"
              text="Try a different search or clear the filters to see every open position."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center rounded-full bg-greenPrimary-500 px-6 font-semibold text-white hover:bg-greenPrimary-600 cursor-pointer"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {visibleJobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section aria-labelledby="how-to-apply" className="flex flex-col gap-6">
          <h2 id="how-to-apply" className="text-2xl font-bold text-neutralPrimary-800">
            How to apply
          </h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {HIRING_STEPS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-neutralPrimary-100 bg-white p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutralPrimary-400">
                    Step {index + 1}
                  </p>
                  <h3 className="font-semibold text-neutralPrimary-800">{title}</h3>
                  <p className="text-sm leading-relaxed text-neutralPrimary-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </section>
  );
}

function countBy<K extends string>(
  jobs: ICareer[],
  keyOf: (job: ICareer) => K | undefined,
): Partial<Record<K, number>> {
  return jobs.reduce<Partial<Record<K, number>>>((counts, job) => {
    const key = keyOf(job);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function FilterSelect<V extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: V;
  onChange: (value: V) => void;
  options: { value: V; label: string }[];
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        // Radix can echo "" from its hidden native <select>; no option is "".
        if (next) onChange(next as V);
      }}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          fieldTrigger,
          "data-[size=default]:h-11 min-w-0 py-0 md:w-48 [&>span]:truncate",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-50 rounded-lg border border-neutralPrimary-200 bg-white p-0 shadow-lg">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "my-0.5 cursor-pointer rounded-md px-2.5 py-2 text-sm transition-colors",
              option.value === value
                ? "bg-greenPrimary-950 font-medium text-greenPrimary-700 focus:bg-greenPrimary-950 focus:text-greenPrimary-700"
                : "text-neutralPrimary-700 hover:bg-neutralPrimary-100 focus:bg-neutralPrimary-100",
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutralPrimary-300/70 bg-neutralPrimary-50 px-4 py-16 text-center">
      <div className="mb-1 rounded-full bg-white p-4 shadow-sm">{icon}</div>
      <h3 className="text-xl font-bold text-neutralPrimary-700">{title}</h3>
      <p className="max-w-md text-neutralPrimary-500">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
