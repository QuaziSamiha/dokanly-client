"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FileQuestion,
  List,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Hero from "@/components/layout/hero/Hero";
import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupport } from "@/modules/support/hooks/useSupport";
import {
  POLICY_MIN_WORDS,
  SUPPORT_POLICIES,
} from "@/modules/support/constants/support.constants";
import { SupportPolicyType } from "@/modules/support/types/support.types";
import {
  formatLongDate,
  getContentStats,
  IPolicySection,
  preparePolicyHtml,
} from "@/modules/support/utils/support.utils";
import PolicyContent from "./PolicyContent";

const SUPPORT_EMAIL = "info@naturacarebd.com";
const SUPPORT_PHONE = "+8809644556677";

// * Highlights the section currently in view in the table of contents.
function useActiveSection(sections: IPolicySection[]) {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    if (sections.length === 0) return;
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      // * Trigger when a heading passes just below the sticky navbar.
      { rootMargin: "-120px 0px -65% 0px" },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return activeId;
}

function TableOfContents({
  sections,
  activeId,
}: {
  sections: IPolicySection[];
  activeId?: string;
}) {
  return (
    <ul className="flex flex-col border-l border-neutral-200">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
              activeId === section.id
                ? "border-greenPrimary-500 font-medium text-greenPrimary-600"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
            }`}
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function PolicyPage({ type }: { type: SupportPolicyType }) {
  const meta = SUPPORT_POLICIES.find((p) => p.type === type)!;
  const { supports, isSupportLoading } = useSupport();
  const record = supports.find((s) => s.type === type);

  const { html, sections } = useMemo(
    () => preparePolicyHtml(record?.description),
    [record?.description],
  );
  const stats = getContentStats(record?.description);
  const activeId = useActiveSection(sections);
  // * Short placeholder text ("will be added soon...") shows as a notice
  // * instead of a near-empty policy page.
  const hasContent = stats.words >= POLICY_MIN_WORDS;
  const showToc = sections.length >= 2;
  const Icon = meta.icon;
  const otherPolicies = SUPPORT_POLICIES.filter((p) => p.type !== type);

  return (
    <section className="w-full">
      <Hero
        heroHeading={meta.title}
        customBreadCrumb={<CustomBreadCrumb currentItem={meta.title} />}
      />

      <main className="container mx-auto max-xl:px-4 pb-16 pt-6 lg:pt-12">
        {/* --- Mobile policy switcher --- */}
        <nav
          aria-label="Store policies"
          className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
        >
          {SUPPORT_POLICIES.map((policy) => (
            <Link
              key={policy.type}
              href={policy.href}
              aria-current={policy.type === type ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                policy.type === type
                  ? "border-greenPrimary-500 bg-greenPrimary-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-600"
              }`}
            >
              {policy.title}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
          {/* --- Desktop sidebar --- */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-8">
              <nav aria-label="Store policies">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Store policies
                </p>
                <ul className="flex flex-col gap-1">
                  {SUPPORT_POLICIES.map((policy) => {
                    const PolicyIcon = policy.icon;
                    const isActive = policy.type === type;
                    return (
                      <li key={policy.type}>
                        <Link
                          href={policy.href}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-greenPrimary-950 text-greenPrimary-700"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          }`}
                        >
                          <PolicyIcon className="size-4 shrink-0" aria-hidden />
                          {policy.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {showToc && (
                <nav aria-label="On this page">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    On this page
                  </p>
                  <TableOfContents sections={sections} activeId={activeId} />
                </nav>
              )}
            </div>
          </aside>

          {/* --- Policy --- */}
          <article className="min-w-0">
            <header className="border-b border-neutral-200 pb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-greenPrimary-600">
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ring-1 ${meta.iconTone}`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                Store policy
              </div>
              <h1 className="text-2xl font-bold text-neutralPrimary-800 md:text-3xl">
                {meta.title}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-neutral-500">
                {meta.intro}
              </p>

              {isSupportLoading ? (
                <Skeleton className="mt-4 h-4 w-56" />
              ) : (
                record &&
                hasContent && (
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" aria-hidden />
                      Last updated{" "}
                      <time dateTime={record.updatedAt ?? record.createdAt}>
                        {formatLongDate(record.updatedAt ?? record.createdAt)}
                      </time>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden />
                      {stats.readMinutes} min read
                    </span>
                  </p>
                )
              )}
            </header>

            {/* --- Mobile table of contents --- */}
            {!isSupportLoading && showToc && (
              <details className="group mt-6 rounded-lg border border-neutral-200 bg-neutral-50 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-neutralPrimary-800">
                  <List className="size-4" aria-hidden />
                  On this page
                  <span className="ml-auto text-xs font-normal text-neutral-500">
                    {sections.length} sections
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <TableOfContents sections={sections} activeId={activeId} />
                </div>
              </details>
            )}

            {/* --- Content --- */}
            <div className="mt-8">
              {isSupportLoading ? (
                <div className="w-full space-y-4">
                  <Skeleton className="h-6 w-[40%]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[85%]" />
                  <div className="space-y-3 pt-6">
                    <Skeleton className="h-6 w-[35%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </div>
                </div>
              ) : hasContent ? (
                <PolicyContent html={html} />
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center">
                  <FileQuestion className="size-10 text-neutral-300" aria-hidden />
                  <p className="mt-3 text-base font-semibold text-neutralPrimary-800">
                    This policy is being updated
                  </p>
                  <p className="mt-1 max-w-md text-sm text-neutral-500">
                    {stats.text ? `${stats.text} ` : "Please check back soon. "}
                    In the meantime, our Customer Service team can answer any
                    questions you have.
                  </p>
                </div>
              )}
            </div>

            {/* --- Help --- */}
            <section className="mt-12 rounded-xl border border-neutral-200 bg-greenPrimary-950/60 p-6">
              <div className="flex items-start gap-4">
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-white text-greenPrimary-600 shadow-sm sm:flex">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-neutralPrimary-800">
                    Still have a question?
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Our Customer Service team is happy to help with orders,
                    deliveries, returns or anything in this policy.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-greenPrimary-400 hover:text-greenPrimary-600"
                    >
                      <Mail className="size-4" aria-hidden />
                      {SUPPORT_EMAIL}
                    </a>
                    <a
                      href={`tel:${SUPPORT_PHONE}`}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-greenPrimary-400 hover:text-greenPrimary-600"
                    >
                      <Phone className="size-4" aria-hidden />
                      {SUPPORT_PHONE}
                    </a>
                    <Link
                      href="/contact-us"
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-greenPrimary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-greenPrimary-600"
                    >
                      Contact us
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Related policies --- */}
            <section className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-neutralPrimary-800">
                Other store policies
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {otherPolicies.map((policy) => {
                  const PolicyIcon = policy.icon;
                  return (
                    <Link
                      key={policy.type}
                      href={policy.href}
                      className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-greenPrimary-400 hover:shadow-md"
                    >
                      <span
                        className={`flex size-9 items-center justify-center rounded-lg ring-1 ${policy.iconTone}`}
                      >
                        <PolicyIcon className="size-4" aria-hidden />
                      </span>
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold text-neutralPrimary-800">
                        {policy.title}
                        <ArrowRight
                          className="size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-greenPrimary-500"
                          aria-hidden
                        />
                      </span>
                      <span className="text-sm text-neutral-500">{policy.intro}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </article>
        </div>
      </main>
    </section>
  );
}
