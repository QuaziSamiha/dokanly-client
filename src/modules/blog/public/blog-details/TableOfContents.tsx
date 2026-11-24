"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { IArticleHeading } from "../../utils/blog-content.utils";

/** Highlights the heading the reader is currently in. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A heading counts as current once it reaches the upper third.
      { rootMargin: "-96px 0px -66% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function HeadingLinks({
  headings,
  active,
  onPick,
}: {
  headings: IArticleHeading[];
  active: string;
  onPick?: () => void;
}) {
  return (
    <ol className="flex flex-col gap-0.5 border-l border-neutralPrimary-200">
      {headings.map((heading) => {
        const isActive = heading.id === active;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={onPick}
              className={`-ml-px block border-l-2 py-1.5 text-sm leading-snug transition-colors ${
                heading.level === 3 ? "pl-6" : "pl-3"
              } ${
                isActive
                  ? "border-greenPrimary-500 font-semibold text-greenPrimary-600"
                  : "border-transparent text-neutralPrimary-500 hover:border-neutralPrimary-300 hover:text-neutralPrimary-800"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Sticky outline in the desktop sidebar. */
export function TableOfContents({ headings }: { headings: IArticleHeading[] }) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);
  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutralPrimary-400">
        <ListTree size={14} />
        On this page
      </p>
      <HeadingLinks headings={headings} active={active} />
    </nav>
  );
}

/** Collapsible outline shown above the article on phones and tablets. */
export function MobileTableOfContents({
  headings,
}: {
  headings: IArticleHeading[];
}) {
  const [open, setOpen] = useState(false);
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50/60"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-neutralPrimary-700"
      >
        <span className="flex items-center gap-2">
          <ListTree size={16} className="text-greenPrimary-500" />
          On this page
          <span className="text-xs font-medium text-neutralPrimary-400">
            {headings.length} sections
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <HeadingLinks
            headings={headings}
            active={active}
            onPick={() => setOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}
