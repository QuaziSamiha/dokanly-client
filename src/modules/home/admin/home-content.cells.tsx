"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { LuImage } from "react-icons/lu";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { formatDateDDMMYYYY } from "@/lib/utils/date.utils";
import { IHomeContent } from "@/modules/home/types/home-content.types";

/**
 * Cells shared by the five home content tables, styled like the product and
 * category tables: ring badges with a status dot, a muted "—" for empty
 * values, and a primary line with a smaller meta line underneath.
 */

export const BADGE_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset";

export const EmptyCell = ({ title }: { title?: string }) => (
  <span className="text-sm text-neutralPrimary-400" title={title}>
    —
  </span>
);

const isGif = (url?: string) => !!url && /\.gif(\?|$)/i.test(url);

// ============ STATUS ============

const HOME_CONTENT_STATUS: Record<
  IHomeContent["status"],
  { label: string; badge: string; dot: string; hint: string }
> = {
  ACTIVE: {
    label: "Active",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
    hint: "Shown on the home page",
  },
  INACTIVE: {
    label: "Inactive",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
    hint: "Hidden from the home page",
  },
};

export const StatusCell = ({ status }: { status: IHomeContent["status"] }) => {
  const config = HOME_CONTENT_STATUS[status];
  if (!config) return <EmptyCell />;
  return (
    <span className={`${BADGE_BASE} ${config.badge}`} title={config.hint}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

// ============ POSITION ============

/** Display position within the section; lower comes first on the home page. */
export const PositionCell = ({ sortOrder }: { sortOrder?: number | null }) =>
  sortOrder === undefined || sortOrder === null ? (
    <EmptyCell title="No position set" />
  ) : (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-neutralPrimary-100 px-2 text-xs font-semibold text-neutralPrimary-700 tabular-nums ring-1 ring-neutralPrimary-200 ring-inset"
      title={`Position ${sortOrder} on the home page`}
    >
      #{sortOrder}
    </span>
  );

// ============ LINK ============

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const pathOf = (url: string) => {
  try {
    const { pathname, search } = new URL(url);
    const rest = `${pathname}${search}`;
    return rest === "/" ? "" : rest;
  } catch {
    return "";
  }
};

/** An outbound link as "domain" over "path", opening in a new tab. */
export const LinkCell = ({
  url,
  emptyTitle = "No link: the item is not clickable",
}: {
  url?: string | null;
  emptyTitle?: string;
}) => {
  if (!url) return <EmptyCell title={emptyTitle} />;
  const path = pathOf(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="group flex max-w-[220px] flex-col"
    >
      <span className="inline-flex items-center gap-1 text-sm font-medium text-neutralPrimary-700 group-hover:text-greenPrimary-600">
        <span className="truncate">{hostOf(url)}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
      </span>
      {path && (
        <span className="truncate text-xs text-neutralPrimary-500">{path}</span>
      )}
    </a>
  );
};

// ============ LAST UPDATED ============

/** When the item last changed and who changed it (falls back to creation). */
export const UpdatedCell = ({ item }: { item: IHomeContent }) => {
  const wasUpdated = !!item.updatedBy;
  const date = wasUpdated ? item.updatedAt : item.createdAt;
  const person = wasUpdated ? item.updatedBy : item.createdBy;

  if (!date) return <EmptyCell />;
  return (
    <div
      className="flex flex-col whitespace-nowrap"
      title={`${wasUpdated ? "Updated" : "Created"} ${new Date(date).toLocaleString()}`}
    >
      <span className="text-sm text-neutralPrimary-700">
        {formatDateDDMMYYYY(date)}
      </span>
      <span className="text-xs text-neutralPrimary-500">
        {wasUpdated ? "Updated" : "Created"}
        {person?.name ? ` by ${person.name}` : ""}
      </span>
    </div>
  );
};

// ============ THUMBNAIL ============

/**
 * Image preview in a fixed frame. `wide` suits banners (hero slides, OVC);
 * the square frame suits icons and article images.
 */
export const Thumbnail = ({
  src,
  alt,
  wide = false,
  fallback,
}: {
  src?: string | null;
  alt: string;
  wide?: boolean;
  fallback?: React.ReactNode;
}) => (
  <div
    className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutralPrimary-200 bg-neutralPrimary-50 ${
      wide ? "h-12 w-24" : "h-11 w-11"
    }`}
  >
    {src ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={wide ? "96px" : "44px"}
        className="object-contain"
        unoptimized={isGif(src)}
      />
    ) : (
      (fallback ?? <LuImage className="text-lg text-neutralPrimary-300" />)
    )}
  </div>
);

// ============ ACTIONS ============

export const ActionsCell = ({
  item,
  onEdit,
  onDelete,
}: {
  item: IHomeContent;
  onEdit: (data: IHomeContent) => void;
  onDelete?: (data: IHomeContent) => void;
}) => (
  <div className="flex items-center gap-2">
    <button type="button" onClick={() => onEdit(item)}>
      <CustomTooltip action="edit" content="Edit" />
    </button>
    {onDelete && (
      <button type="button" onClick={() => onDelete(item)}>
        <CustomTooltip action="delete" content="Delete" />
      </button>
    )}
  </div>
);
