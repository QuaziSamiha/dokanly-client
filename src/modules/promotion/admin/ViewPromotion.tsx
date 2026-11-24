"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Archive,
  BadgePercent,
  Calendar,
  CalendarRange,
  Check,
  Copy,
  FileText,
  Globe,
  Hourglass,
  Info,
  Lock,
  Receipt,
  ShoppingCart,
  TicketPercent,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import CancelButton from "@/components/primitives/button/CancelButton";
import { IModal } from "@/types";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import {
  PROMOTION_STATUS_STYLES,
  daysBetween,
  describeOffer,
  durationDays,
  formatDate,
  formatDateTime,
  formatDiscount,
  formatTk,
  isPercentage,
  promotionPhase,
  scheduleHint,
  usageBarClass,
  usagePercent,
} from "@/modules/promotion/utils/promotion.utils";

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

// Shared lift-on-hover for cards.
const LIFT =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function StatusPill({ status }: { status: IPromotion["status"] }) {
  const style = PROMOTION_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "ACTIVE" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {style.label}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`group relative min-w-0 cursor-default overflow-hidden rounded-xl p-3 sm:p-4 ${ENTER} ${LIFT} ${className}`}
      style={enterDelay(delay)}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-current opacity-[0.06] transition-transform duration-500 ease-out group-hover:scale-[2.2]" />
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:gap-2 sm:text-xs">
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-xl font-bold sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} group rounded-xl border border-neutralPrimary-100 bg-white p-3 transition-all duration-300 hover:border-greenPrimary-200 hover:shadow-md sm:p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
          <span className="text-greenPrimary-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            {icon}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** One term of the offer: label on the left, value on the right. */
function Rule({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-neutralPrimary-500">{label}</p>
        {hint && <p className="text-xs text-neutralPrimary-400">{hint}</p>}
      </div>
      <p className="shrink-0 text-right text-sm font-semibold text-neutralPrimary-800">
        {value}
      </p>
    </div>
  );
}

function Notice({
  tone,
  icon,
  children,
}: {
  tone: "warning" | "info" | "muted";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneClass = {
    warning:
      "border-warningPrimary-200 bg-warningPrimary-100 text-warningPrimary-600",
    info: "border-blueSecondary-100 bg-blueSecondary-50 text-blueSecondary-600",
    muted:
      "border-neutralPrimary-200 bg-neutralPrimary-50 text-neutralPrimary-600",
  }[tone];
  return (
    <div
      style={enterDelay(80)}
      className={`${ENTER} flex items-start gap-3 rounded-xl border p-3 text-sm ${toneClass}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>{children}</p>
    </div>
  );
}

function AuditRow({
  label,
  date,
  name,
  role,
}: {
  label: string;
  date?: string | Date;
  name?: string | null;
  role?: string | null;
}) {
  return (
    <div className="group flex cursor-default items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-sm font-semibold text-blueSecondary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blueSecondary-600 group-hover:text-white group-hover:shadow-md">
        {name ? name.charAt(0).toUpperCase() : <Calendar size={16} />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        <p className="break-words text-sm text-neutralPrimary-700 sm:truncate">
          {formatDateTime(date)}
          {name && (
            <span className="text-neutralPrimary-400">
              {" "}
              by {name}
              {role ? ` (${role.toLowerCase()})` : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy code"
      className="group/code inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-dashed border-greenPrimary-400 bg-white/80 px-3 py-1.5 font-mono text-lg font-bold tracking-[0.15em] text-greenPrimary-700 transition-all duration-300 hover:border-greenPrimary-600 hover:bg-white hover:shadow-md active:scale-95 sm:text-xl"
    >
      <span className="truncate">{code}</span>
      {copied ? (
        <Check size={16} className="shrink-0 text-success-600" />
      ) : (
        <Copy
          size={16}
          className="shrink-0 text-greenPrimary-400 transition-colors group-hover/code:text-greenPrimary-600"
        />
      )}
    </button>
  );
}

/** Start → today → end, with how far through the promotion today is. */
function Timeline({ promotion }: { promotion: IPromotion }) {
  const total = durationDays(promotion.startDate, promotion.endDate) ?? 1;
  const elapsed = daysBetween(promotion.startDate, new Date()) + 1;
  const percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
  const notStarted = elapsed <= 0;
  const ended = elapsed > total;

  return (
    <div className="space-y-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutralPrimary-100">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            ended ? "bg-neutralPrimary-400" : "bg-greenPrimary-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
            Starts
          </p>
          <p className="font-semibold text-neutralPrimary-700">
            {formatDate(promotion.startDate)}
          </p>
        </div>
        <p className="self-center rounded-full bg-neutralPrimary-50 px-3 py-1 text-xs font-medium text-neutralPrimary-500">
          {notStarted
            ? scheduleHint(promotion)
            : ended
              ? `Ran for ${total} day${total === 1 ? "" : "s"}`
              : `Day ${elapsed} of ${total}`}
        </p>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
            Ends
          </p>
          <p className="font-semibold text-neutralPrimary-700">
            {formatDate(promotion.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ViewPromotion({ data, onClose, setOpen }: IModal) {
  const promotion = data as IPromotion | undefined;
  const close = () => (onClose ? onClose() : setOpen?.(false));

  if (!promotion) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <TicketPercent size={32} />
        No promotion details available.
      </div>
    );
  }

  const phase = promotionPhase(promotion);
  const percentUsed = usagePercent(promotion);
  const remaining =
    promotion.usageLimit != null
      ? Math.max(0, promotion.usageLimit - promotion.usedCount)
      : null;
  const total = durationDays(promotion.startDate, promotion.endDate);
  const live = promotion.status === "ACTIVE" || promotion.status === "INACTIVE";

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} group/hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 transition-shadow duration-500 hover:shadow-lg hover:ring-greenPrimary-200 sm:p-5`}
      >
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover/hero:left-full group-hover/hero:opacity-100 motion-reduce:hidden" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-greenPrimary-500 to-greenPrimary-700 text-greenPrimary-50 shadow-md transition-all duration-500 ease-out hover:-rotate-6 hover:scale-110 hover:shadow-xl sm:h-20 sm:w-20">
            <span className="text-lg font-bold leading-none sm:text-2xl">
              {formatDiscount(promotion)}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest opacity-80">
              off
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {promotion.title && (
              <p className="break-words text-sm font-medium text-neutralPrimary-500">
                {promotion.title}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <CopyCode code={promotion.couponCode} />
              <StatusPill status={promotion.status} />
              {promotion.isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blueSecondary-50 px-2.5 py-1 text-xs font-semibold text-blueSecondary-600">
                  <Globe size={12} />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutralPrimary-100 px-2.5 py-1 text-xs font-semibold text-neutralPrimary-600">
                  <Lock size={12} />
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-neutralPrimary-600">
              {describeOffer(promotion)}.
            </p>
          </div>
        </div>
      </div>

      {/* Why customers can or can't use it */}
      {promotion.status === "ARCHIVED" && (
        <Notice tone="warning" icon={<Archive size={18} />}>
          <span className="font-semibold">Archived.</span> This code can no
          longer be used or edited. Orders that used it keep their discount.
        </Notice>
      )}
      {promotion.status === "EXPIRED" && (
        <Notice tone="muted" icon={<Hourglass size={18} />}>
          <span className="font-semibold">Expired</span> on{" "}
          {formatDate(promotion.endDate)}. Edit it and pick a new end date to
          switch it back on.
        </Notice>
      )}
      {promotion.status === "INACTIVE" && (
        <Notice tone="warning" icon={<AlertTriangle size={18} />}>
          <span className="font-semibold">Paused.</span> Customers can&apos;t
          use this code until it is set to Active.
        </Notice>
      )}
      {phase === "UPCOMING" && (
        <Notice tone="info" icon={<Info size={18} />}>
          <span className="font-semibold">Not started yet.</span>{" "}
          {scheduleHint(promotion)}
          {promotion.isPublic ? "; customers see it as coming soon." : "."}
        </Notice>
      )}
      {phase === "USED_UP" && (
        <Notice tone="warning" icon={<AlertTriangle size={18} />}>
          <span className="font-semibold">Usage limit reached.</span> Raise
          the limit to let more customers use it.
        </Notice>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatTile
          icon={<BadgePercent size={14} />}
          label="Discount"
          value={formatDiscount(promotion)}
          hint={
            isPercentage(promotion)
              ? promotion.maxDiscountAmount
                ? `Capped at ${formatTk(promotion.maxDiscountAmount)}`
                : "No cap"
              : "Flat amount"
          }
          className="bg-greenPrimary-950 text-greenPrimary-700"
          delay={100}
        />
        <StatTile
          icon={<Users size={14} />}
          label="Used"
          value={
            promotion.usageLimit
              ? `${promotion.usedCount}/${promotion.usageLimit}`
              : promotion.usedCount
          }
          hint={
            remaining === null
              ? "Unlimited uses"
              : `${remaining} use${remaining === 1 ? "" : "s"} left`
          }
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={170}
        />
        <StatTile
          icon={<CalendarRange size={14} />}
          label="Duration"
          value={total ? `${total}d` : "—"}
          hint={live ? scheduleHint(promotion) : `Ended ${formatDate(promotion.endDate)}`}
          className="bg-purpleSecondary-100 text-purpleSecondary-500"
          delay={240}
        />
        <StatTile
          icon={<ShoppingCart size={14} />}
          label="Min. Order"
          value={promotion.minPurchase ? formatTk(promotion.minPurchase) : "None"}
          hint={
            promotion.maxPurchase
              ? `Max. ${formatTk(promotion.maxPurchase)}`
              : "No maximum"
          }
          className="bg-orangeSecondary-100 text-orangeSecondary-500"
          delay={310}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Offer terms */}
        <Section delay={380} icon={<Receipt size={16} />} title="Offer Terms">
          <div className="divide-y divide-neutralPrimary-100">
            <Rule
              label="Discount type"
              value={isPercentage(promotion) ? "Percentage" : "Fixed amount"}
            />
            <Rule
              label="Discount"
              value={formatDiscount(promotion)}
              hint={
                isPercentage(promotion)
                  ? "Of the order subtotal"
                  : "Taken off the order subtotal"
              }
            />
            {isPercentage(promotion) && (
              <Rule
                label="Maximum discount"
                value={formatTk(promotion.maxDiscountAmount)}
                hint={promotion.maxDiscountAmount ? undefined : "Uncapped"}
              />
            )}
            <Rule
              label="Minimum order"
              value={formatTk(promotion.minPurchase)}
            />
            <Rule
              label="Maximum order"
              value={formatTk(promotion.maxPurchase)}
            />
            <Rule
              label="Visibility"
              value={promotion.isPublic ? "Public" : "Private"}
              hint={
                promotion.isPublic
                  ? "Listed in the promo bar and offers page"
                  : "Works only when typed at checkout"
              }
            />
          </div>
        </Section>

        <div className="space-y-4 sm:space-y-5">
          {/* Schedule */}
          <Section delay={440} icon={<CalendarRange size={16} />} title="Schedule">
            <Timeline promotion={promotion} />
          </Section>

          {/* Usage */}
          <Section
            delay={500}
            icon={<Users size={16} />}
            title="Usage"
            aside={
              percentUsed !== null && (
                <span className="text-xs font-semibold text-neutralPrimary-500">
                  {percentUsed}% used
                </span>
              )
            }
          >
            {percentUsed !== null ? (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutralPrimary-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${usageBarClass(percentUsed)}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <p className="text-sm text-neutralPrimary-600">
                  Used in{" "}
                  <span className="font-semibold">{promotion.usedCount}</span>{" "}
                  of {promotion.usageLimit} allowed orders.
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutralPrimary-600">
                Used in{" "}
                <span className="font-semibold">{promotion.usedCount}</span>{" "}
                order{promotion.usedCount === 1 ? "" : "s"}. No usage limit.
              </p>
            )}
          </Section>
        </div>
      </div>

      {/* Internal note */}
      <Section delay={560} icon={<FileText size={16} />} title="Internal Note">
        {promotion.description ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-600">
            {promotion.description}
          </p>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            No note added.
          </p>
        )}
      </Section>

      {/* Audit */}
      <div
        style={enterDelay(620)}
        className={`${ENTER} grid grid-cols-1 gap-3 rounded-xl bg-neutralPrimary-50 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4`}
      >
        <AuditRow
          label="Created"
          date={promotion.createdAt}
          name={promotion.createdByName}
          role={promotion.createdByRole}
        />
        <AuditRow
          label="Last Updated"
          date={promotion.updatedAt}
          name={promotion.updatedByName}
          role={promotion.updatedByRole}
        />
      </div>

      <div className="flex justify-end border-t border-neutralPrimary-100 pt-4">
        <CancelButton
          onClick={close}
          label="Close"
          className="w-full transition-all hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 hover:shadow-md active:translate-y-0 active:scale-95 sm:w-auto"
        />
      </div>
    </div>
  );
}
