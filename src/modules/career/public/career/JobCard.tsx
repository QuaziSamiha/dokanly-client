import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import {
  DeadlineBadge,
  JobTypeBadge,
  WorkModeBadge,
} from "../../components/CareerBadges";
import { ICareer } from "../../types/career.types";
import {
  formatDeadline,
  postedLabel,
  salaryLabel,
} from "../../utils/career.utils";

/** One opening in the careers list. The whole card is the link. */
export default function JobCard({ job }: { job: ICareer }) {
  return (
    <Link
      href={`/career-details/${job.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-neutralPrimary-300/70 bg-white p-5 shadow-neutral02 transition-all duration-200 hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <JobTypeBadge job={job} />
        <WorkModeBadge job={job} />
        <DeadlineBadge deadline={job.deadline} className="sm:ml-auto" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold leading-snug text-neutralPrimary-800 transition-colors group-hover:text-greenPrimary-600 sm:text-xl">
          {job.position}
        </h3>
        <dl className="flex flex-col gap-1.5 text-sm text-neutralPrimary-600 sm:flex-row sm:flex-wrap sm:gap-x-5">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Location</dt>
            <MapPin className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
            <dd>{job.jobLocation}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Salary</dt>
            <Wallet className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
            <dd>{salaryLabel(job.salary)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutralPrimary-100 pt-4 text-sm">
        <p className="flex min-w-0 items-center gap-1.5 text-neutralPrimary-500">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">
            Apply by{" "}
            <span className="font-medium text-neutralPrimary-700">
              {formatDeadline(job.deadline)}
            </span>
            <span className="max-sm:hidden"> · {postedLabel(job.createdAt)}</span>
          </span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-greenPrimary-600">
          View job
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
