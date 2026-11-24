import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Users } from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { cn } from "@/lib/utils";
import { DeadlineBadge } from "../components/CareerBadges";
import { IAdminCareer } from "../types/career.types";
import {
  deadlineState,
  formatDeadline,
  jobTypeLabel,
  salaryLabel,
  workModeLabel,
} from "../utils/career.utils";

const VISIBILITY_STYLES = {
  live: {
    label: "Live",
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    hint: "Shown on the careers page",
  },
  expired: {
    label: "Expired",
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-400/30",
    dot: "bg-neutralPrimary-400",
    hint: "Past the deadline",
  },
  inactive: {
    label: "Inactive",
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
    hint: "Hidden by an admin",
  },
} as const;

/** Live = ACTIVE and not past the deadline, i.e. shown on the careers page. */
const visibility = (job: IAdminCareer) => {
  if (job.status === "INACTIVE") return VISIBILITY_STYLES.inactive;
  if (deadlineState(job.deadline) === "closed") return VISIBILITY_STYLES.expired;
  return VISIBILITY_STYLES.live;
};

export const getCareerColumns = (
  handleEdit: (data: IAdminCareer) => void,
  handleDelete: (data: IAdminCareer) => void,
  handleAllApplication: (data: IAdminCareer) => void,
): ColumnDef<IAdminCareer>[] => [
  {
    accessorKey: "position",
    header: "Position",
    enableSorting: false,
    cell: ({ row }) => {
      const job = row.original;
      const isLive = visibility(job) === VISIBILITY_STYLES.live;
      return (
        <div className="flex min-w-[12rem] max-w-[18rem] flex-col gap-0.5">
          <span className="font-semibold text-neutralPrimary-800">{job.position}</span>
          <span className="text-xs text-neutralPrimary-400">
            {[jobTypeLabel(job), workModeLabel(job), job.jobLocation].filter(Boolean).join(" · ")}
          </span>
          {isLive && (
            <Link
              href={`/career-details/${job.slug}`}
              target="_blank"
              className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs font-medium text-greenPrimary-600 hover:underline"
            >
              View on site <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1 whitespace-nowrap">
        <span className="text-sm text-neutralPrimary-700">
          {formatDeadline(row.original.deadline)}
        </span>
        <DeadlineBadge deadline={row.original.deadline} className="px-2 py-0.5 text-[11px]" />
      </div>
    ),
  },
  {
    accessorKey: "applicationCount",
    header: "Applications",
    enableSorting: false,
    cell: ({ row }) => {
      const count = row.original.applicationCount ?? 0;
      return (
        <button
          type="button"
          onClick={() => handleAllApplication(row.original)}
          title="View applicants"
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2",
            count > 0
              ? "bg-blueSecondary-50 text-blueSecondary-600 ring-blueSecondary-600/20 hover:bg-blueSecondary-100"
              : "bg-neutralPrimary-100 text-neutralPrimary-500 ring-neutralPrimary-400/30 hover:bg-neutralPrimary-200",
          )}
        >
          <Users size={12} aria-hidden />
          <span className="font-semibold">{count}</span>
          {count === 1 ? "applicant" : "applicants"}
        </button>
      );
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-neutralPrimary-700">
        {salaryLabel(row.original.salary)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = visibility(row.original);
      return (
        <span
          title={style.hint}
          className={cn(
            "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
            style.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
          {style.label}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => handleEdit(row.original)} aria-label="Edit job">
          <CustomTooltip action="edit" content="Edit" />
        </button>
        <button type="button" onClick={() => handleDelete(row.original)} aria-label="Delete job">
          <CustomTooltip action="delete" content="Delete" />
        </button>
      </div>
    ),
  },
];
