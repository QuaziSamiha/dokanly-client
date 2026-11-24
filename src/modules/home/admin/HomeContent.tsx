"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import CustomTabGroupPrimary from "@/components/primitives/tab/CustomTabGroupPrimary";
import { cn } from "@/lib/utils";
import { ITabListPrimary } from "@/types";
import {
  DEFAULT_HOME_CONTENT_TAB,
  HOME_CONTENT_SECTIONS,
  homeDashboardTabContent,
  IHomeContentSection,
} from "@/modules/home/constants/home-admin.constants";
import {
  IHomeContentCount,
  useHomeContentCounts,
} from "@/modules/home/hooks/useHomeContentCounts";

const TAB_PARAM = "tab";

function HomeContentTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { counts } = useHomeContentCounts();

  /**
   * The active tab lives in the URL (?tab=heroSlider), so a refresh, a shared
   * link or returning from another page opens the same section. An unknown
   * value falls back to the first tab.
   */
  const requested = searchParams.get(TAB_PARAM);
  const activeTab = HOME_CONTENT_SECTIONS.some((s) => s.value === requested)
    ? (requested as string)
    : DEFAULT_HOME_CONTENT_TAB;

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_HOME_CONTENT_TAB) params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    const query = params.toString();
    //* replace, not push: flipping tabs should not fill the back button history.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const tabList: ITabListPrimary[] = HOME_CONTENT_SECTIONS.map((section) => {
    const Icon = section.icon;
    return {
      label: section.label,
      value: section.value,
      icon: <Icon />,
      count: counts[section.type]?.total,
    };
  });

  const tabContent = homeDashboardTabContent.map((tab) => {
    const section = HOME_CONTENT_SECTIONS.find((s) => s.value === tab.value);
    return {
      value: tab.value,
      content: (
        <div className="flex flex-col gap-6">
          {section ? (
            <SectionHint section={section} count={counts[section.type]} />
          ) : null}
          {tab.content}
        </div>
      ),
    };
  });

  return (
    <CustomTabGroupPrimary
      tabList={tabList}
      tabContent={tabContent}
      value={activeTab}
      onValueChange={handleTabChange}
      wrap
      rightSlot={
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-neutralPrimary-300/80 bg-white px-4 py-2.5 text-sm font-medium text-neutralPrimary-600 transition-colors hover:border-greenPrimary-400 hover:text-greenPrimary-600 focus-visible:ring-2 focus-visible:ring-greenPrimary-500/60 focus-visible:outline-none"
        >
          <ExternalLink className="size-4" />
          View home page
        </Link>
      }
    />
  );
}

/**
 * Where the section appears on the storefront, and whether what is live
 * matches what the home page can show.
 */
function SectionHint({
  section,
  count,
}: {
  section: IHomeContentSection;
  count?: IHomeContentCount;
}) {
  const Icon = section.icon;
  const limitText =
    section.homeLimit === 1
      ? "the home page shows 1"
      : `the home page shows up to ${section.homeLimit}`;

  let status: { tone: "ok" | "warn"; text: string } | null = null;
  if (count) {
    if (count.active === 0) {
      status = {
        tone: "warn",
        text: "Nothing is active, so this section is hidden on the home page",
      };
    } else if (count.active > section.homeLimit) {
      status = {
        tone: "warn",
        text: `${count.active} active, but ${limitText}: only the first ${section.homeLimit} by order appear`,
      };
    } else {
      status = { tone: "ok", text: `${count.active} active · ${limitText}` };
    }
  }

  return (
    //* STACKS ON PHONES: SHARING ONE ROW WITH THE STATUS PILL SQUEEZED THE HINT
    //* TEXT DOWN TO ONE WORD PER LINE.
    <div className="flex flex-col gap-3 rounded-2xl border border-neutralPrimary-300/70 bg-gradient-to-r from-neutralPrimary-100/80 to-white px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-greenPrimary-500/10 text-greenPrimary-600 [&_svg]:size-5">
          <Icon />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutralPrimary-800">
            {section.label}
          </p>
          <p className="text-sm text-neutralPrimary-500">{section.hint}</p>
        </div>
      </div>

      {status ? (
        <span
          className={cn(
            "inline-flex w-fit items-start gap-2 rounded-full px-3 py-1 text-xs font-medium sm:max-w-xs sm:shrink-0",
            status.tone === "ok" && "bg-greenPrimary-500/10 text-greenPrimary-700",
            status.tone === "warn" && "bg-amber-100 text-amber-800",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-1.5 size-1.5 shrink-0 rounded-full",
              status.tone === "ok" ? "bg-greenPrimary-500" : "bg-amber-500",
            )}
          />
          {status.text}
        </span>
      ) : (
        <span className="h-6 w-40 shrink-0 animate-pulse rounded-full bg-neutralPrimary-200" />
      )}
    </div>
  );
}

//* useSearchParams NEEDS A SUSPENSE BOUNDARY IN THE APP ROUTER.
export default function HomeContent() {
  return (
    <section className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div className="flex w-fit items-center gap-1 rounded-2xl border border-neutralPrimary-300/80 bg-neutralPrimary-100/70 p-1.5">
            {HOME_CONTENT_SECTIONS.map((section) => (
              <div
                key={section.value}
                className="h-9 w-28 animate-pulse rounded-xl bg-neutralPrimary-200"
              />
            ))}
          </div>
        }
      >
        <HomeContentTabs />
      </Suspense>
    </section>
  );
}
