import {
  CLOSING_SOON_DAYS,
  JOB_LOCATION_TYPE_LABELS,
  JOB_TYPE_LABELS,
  NEGOTIABLE_SALARY,
} from "../constants/career.constants";
import { ICareer } from "../types/career.types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The calendar day of a date, in the viewer's time zone, as a UTC timestamp. */
const dayOf = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Whole days from today until the deadline day. 0 = closes today, negative =
 * already closed. Deadlines are stored as UTC midnight of the chosen day.
 */
export function daysUntil(deadline: string): number {
  const end = new Date(deadline);
  const endDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  return Math.round((endDay - dayOf(new Date())) / DAY_MS);
}

export type DeadlineState = "open" | "closingSoon" | "closed";

export function deadlineState(deadline: string): DeadlineState {
  const days = daysUntil(deadline);
  if (days < 0) return "closed";
  if (days <= CLOSING_SOON_DAYS) return "closingSoon";
  return "open";
}

/** "Closes today", "Closes tomorrow", "8 days left", "Closed". */
export function deadlineLabel(deadline: string): string {
  const days = daysUntil(deadline);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `${days} days left`;
}

/** "30 Nov 2026". Deadlines are calendar days, so they are read in UTC. */
export function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Posted today", "Posted yesterday", "Posted 4 days ago", or the date. */
export function postedLabel(createdAt: string): string {
  const days = Math.round(
    (dayOf(new Date()) - dayOf(new Date(createdAt))) / DAY_MS,
  );
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function salaryLabel(salary: string | null | undefined): string {
  return salary?.trim() ? salary : NEGOTIABLE_SALARY;
}

export const jobTypeLabel = (job: Pick<ICareer, "jobType">) =>
  JOB_TYPE_LABELS[job.jobType] ?? job.jobType;

export const workModeLabel = (job: Pick<ICareer, "jobLocationType">) =>
  job.jobLocationType ? JOB_LOCATION_TYPE_LABELS[job.jobLocationType] : null;

/** "1.2 MB", "340 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "1 year", "2.5 years". */
export function experienceLabel(years: number | null | undefined): string | null {
  if (years === null || years === undefined) return null;
  if (years === 0) return "Fresher";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

/** Plain text of admin-written HTML, for meta descriptions. */
export function htmlToText(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<\/(p|li|h\d)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}
