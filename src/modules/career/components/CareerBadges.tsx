import { Briefcase, Clock, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICareer } from "../types/career.types";
import {
  deadlineLabel,
  deadlineState,
  jobTypeLabel,
  workModeLabel,
} from "../utils/career.utils";

const BADGE =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap";

export function JobTypeBadge({ job }: { job: Pick<ICareer, "jobType"> }) {
  return (
    <span className={cn(BADGE, "bg-greenPrimary-950 text-greenPrimary-700")}>
      <Briefcase className="h-3.5 w-3.5" aria-hidden />
      {jobTypeLabel(job)}
    </span>
  );
}

export function WorkModeBadge({
  job,
}: {
  job: Pick<ICareer, "jobLocationType">;
}) {
  const label = workModeLabel(job);
  if (!label) return null;
  return (
    <span className={cn(BADGE, "bg-blueSecondary-50 text-blueSecondary-700")}>
      <Globe2 className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

const DEADLINE_STYLES = {
  open: "bg-neutralPrimary-100 text-neutralPrimary-600",
  closingSoon: "bg-warningPrimary-100 text-warningPrimary-800",
  closed: "bg-destructive-100 text-destructive-700",
} as const;

/** "8 days left" in grey, amber when the deadline is close, red once closed. */
export function DeadlineBadge({
  deadline,
  className,
}: {
  deadline: string;
  className?: string;
}) {
  const state = deadlineState(deadline);
  return (
    <span className={cn(BADGE, DEADLINE_STYLES[state], className)}>
      <Clock className="h-3.5 w-3.5" aria-hidden />
      {deadlineLabel(deadline)}
    </span>
  );
}
