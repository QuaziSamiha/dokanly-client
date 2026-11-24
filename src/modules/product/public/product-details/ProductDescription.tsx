"use client";

import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const COLLAPSED_HEIGHT = 420;

/** Rich-text description from the admin editor, collapsed behind "Read more" when long. */
export default function ProductDescription({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLong, setIsLong] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const measure = () => setIsLong(node.scrollHeight > COLLAPSED_HEIGHT + 80);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [html]);

  const collapsed = isLong && !expanded;

  return (
    <section
      aria-labelledby="product-description-heading"
      className="w-full rounded-xl border border-neutralPrimary-100 bg-white p-4 sm:rounded-2xl sm:p-8"
    >
      <h2
        id="product-description-heading"
        className="mb-3 text-lg font-semibold text-neutralPrimary-800 sm:mb-4 sm:text-xl md:text-2xl"
      >
        Product Details
      </h2>
      <div className="relative">
        <div
          ref={contentRef}
          style={collapsed ? { maxHeight: COLLAPSED_HEIGHT } : undefined}
          className="overflow-hidden text-sm leading-relaxed break-words text-neutral-600 md:text-base [&_*]:max-w-full [&_*]:![text-align:left] [&_a]:text-greenPrimary-600 [&_a]:underline [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-neutralPrimary-800 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutralPrimary-800 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-neutralPrimary-800 [&_img]:h-auto [&_img]:rounded-lg [&_li]:mb-1.5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p]:min-h-[1.2em] [&_strong]:font-semibold [&_strong]:text-neutralPrimary-800 [&_table]:block [&_table]:overflow-x-auto md:[&_table]:table [&_table]:w-full [&_td]:border [&_td]:border-neutralPrimary-200 [&_td]:p-2 [&_th]:border [&_th]:border-neutralPrimary-200 [&_th]:p-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-4 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </section>
  );
}
