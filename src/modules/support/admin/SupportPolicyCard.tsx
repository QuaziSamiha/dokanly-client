"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  PencilLine,
  Plus,
} from "lucide-react";
import { ISupportPolicyMeta } from "@/modules/support/constants/support.constants";
import { ISupport } from "@/modules/support/types/support.types";
import {
  formatTimeAgo,
  getContentStats,
  PolicyHealth,
} from "@/modules/support/utils/support.utils";
import { formatDate } from "@/lib/utils/date.utils";

interface ISupportPolicyCard {
  meta: ISupportPolicyMeta;
  record?: ISupport;
  health: PolicyHealth;
  onEdit: () => void;
}

const healthBadge: Record<PolicyHealth["level"], { label: string; className: string }> = {
  ok: { label: "Live", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  warning: { label: "Needs review", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  missing: { label: "Not set up", className: "bg-red-50 text-red-700 ring-red-200" },
};

export default function SupportPolicyCard({
  meta,
  record,
  health,
  onEdit,
}: ISupportPolicyCard) {
  const Icon = meta.icon;
  const badge = healthBadge[health.level];
  const stats = getContentStats(record?.description);
  const lastEditor = record?.updatedBy ?? record?.createdBy;
  const lastEditedAt = record?.updatedAt ?? record?.createdAt;

  return (
    <article className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* --- Header --- */}
      <header className="flex items-start gap-4 p-5 pb-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.iconTone}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-neutralPrimary-800">
              {meta.title}
            </h2>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${badge.className}`}
            >
              {health.level === "ok" && (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
              {badge.label}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">{meta.summary}</p>
        </div>
      </header>

      {/* --- Content preview --- */}
      <div className="flex flex-1 flex-col gap-3 px-5">
        {record ? (
          <p className="line-clamp-3 rounded-lg bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600">
            {stats.text || "No content yet."}
          </p>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
            This page has no content yet.
          </div>
        )}

        {health.level !== "ok" && (
          <p
            className={`flex items-start gap-2 text-sm ${
              health.level === "missing" ? "text-red-700" : "text-amber-700"
            }`}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {health.message}
          </p>
        )}

        {record && (
          <dl className="grid grid-cols-3 divide-x divide-neutral-200 rounded-lg border border-neutral-200 text-center">
            <div className="px-2 py-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Words
              </dt>
              <dd className="text-sm font-semibold text-neutralPrimary-800">
                {stats.words.toLocaleString()}
              </dd>
            </div>
            <div className="px-2 py-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Sections
              </dt>
              <dd className="text-sm font-semibold text-neutralPrimary-800">
                {stats.sections}
              </dd>
            </div>
            <div className="px-2 py-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Read time
              </dt>
              <dd className="text-sm font-semibold text-neutralPrimary-800">
                {stats.readMinutes} min
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* --- Footer --- */}
      <footer className="mt-4 flex flex-col gap-3 border-t border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="flex items-center gap-1.5 text-xs text-neutral-500"
          title={lastEditedAt ? formatDate(lastEditedAt) : undefined}
        >
          {record ? (
            <>
              <Clock className="size-3.5" aria-hidden />
              Updated {formatTimeAgo(lastEditedAt)}
              {lastEditor?.name && (
                <>
                  {" "}by{" "}
                  <span className="font-medium text-neutral-700">
                    {lastEditor.name}
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              <Clock className="size-3.5" aria-hidden />
              Not published yet
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {record && (
            <Link
              href={meta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              View page
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-greenPrimary-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25"
          >
            {record ? (
              <>
                <PencilLine className="size-4" aria-hidden />
                Edit content
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                Set up page
              </>
            )}
          </button>
        </div>
      </footer>
    </article>
  );
}
