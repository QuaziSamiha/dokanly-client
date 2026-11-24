"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  FileText,
  Inbox,
  Mail,
  MapPin,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import CancelButton from "@/components/primitives/button/CancelButton";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import { IModal } from "@/types";
import {
  useCareerApplications,
  useDeleteApplication,
} from "../hooks/useCareerApplication";
import { IAdminCareer, IApplication } from "../types/career.types";
import { experienceLabel, formatDeadline } from "../utils/career.utils";
import ApplicationCardSkeleton from "./ApplicationCardSkeleton";

const SEARCH_DEBOUNCE_MS = 400;

const appliedLabel = (appliedAt: string) =>
  new Date(appliedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function AllApplications({ data, setOpen, refetch }: IModal) {
  const job = data as IAdminCareer;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { applications, isApplicationsLoading, isApplicationsFetching, refetchApplications } =
    useCareerApplications(job?.id, search);

  const { deleteApplication, isDeletingApplication } = useDeleteApplication();
  const [deleteTarget, setDeleteTarget] = useState<IApplication | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteApplication(deleteTarget.id, () => {
      setDeleteTarget(null);
      refetchApplications();
      // * The jobs table shows the application count.
      refetch?.();
    });
  };

  // * The loaded list is the live count; the row's count only stands in while
  // * loading or while a search narrows the list.
  const total =
    isApplicationsLoading || search
      ? (job?.applicationCount ?? 0)
      : applications.length;

  return (
    <section className="flex h-full max-h-[85vh] flex-col">
      {/* --- Header --- */}
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-white px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-neutralPrimary-800 sm:text-2xl">Applicants</h2>
          <p className="text-sm text-neutralPrimary-500">
            <span className="font-medium text-neutralPrimary-700">{job?.position}</span>
            {" · "}
            {total} {total === 1 ? "application" : "applications"}
            {job?.deadline && ` · Deadline ${formatDeadline(job.deadline)}`}
          </p>
        </div>
        {total > 0 && (
          <label className="relative">
            <span className="sr-only">Search applicants</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutralPrimary-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email or phone"
              className="h-10 w-full rounded-lg border border-neutralPrimary-300 bg-white pl-9 pr-3 text-sm focus:border-greenPrimary-500 focus:outline-none focus:ring-4 focus:ring-greenPrimary-500/15"
            />
          </label>
        )}
      </div>

      {/* --- List --- */}
      <div
        className="flex-1 overflow-y-auto scrollbar-brand bg-neutral-50/50 p-4 sm:p-6"
        aria-busy={isApplicationsFetching}
      >
        {isApplicationsLoading ? (
          <div className="flex flex-col gap-4">
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
          </div>
        ) : applications.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {applications.map((application) => (
              <li key={application.id}>
                <ApplicationCard
                  application={application}
                  onDelete={() => setDeleteTarget(application)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white px-4 py-16 text-center">
            <Inbox className="h-10 w-10 text-neutral-300" aria-hidden />
            <p className="font-medium text-neutralPrimary-600">
              {search ? "No applicants match your search." : "No applications yet."}
            </p>
            {!search && (
              <p className="text-sm text-neutralPrimary-500">
                Applications sent from the job page will show up here.
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <div className="sticky bottom-0 z-10 flex justify-end border-t bg-white p-4">
        <CancelButton onClick={() => setOpen?.(false)} label="Close" />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isPending={isDeletingApplication}
        title="Delete this application?"
        confirmLabel="Delete application"
        description="The application and the uploaded resume are deleted permanently."
      >
        {deleteTarget && (
          <p className="rounded-lg bg-neutralPrimary-100 px-3 py-2 text-sm">
            <span className="font-semibold text-neutralPrimary-800">{deleteTarget.name}</span>
            <span className="text-neutralPrimary-500"> · {deleteTarget.email}</span>
          </p>
        )}
      </ConfirmModal>
    </section>
  );
}

function ApplicationCard({
  application,
  onDelete,
}: {
  application: IApplication;
  onDelete: () => void;
}) {
  const skills =
    application.skills
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) ?? [];
  const experience = experienceLabel(application.yearsOfExperience);
  const initials = application.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-greenPrimary-200 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-sm font-bold text-greenPrimary-700"
          aria-hidden
        >
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="text-base font-bold text-neutralPrimary-800 sm:text-lg">
              {application.name}
            </h3>
            <p className="flex shrink-0 items-center gap-1.5 text-xs text-neutralPrimary-500">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Applied {appliedLabel(application.appliedAt)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-neutralPrimary-600 md:grid-cols-2">
            <a
              href={`mailto:${application.email}`}
              className="flex min-w-0 items-center gap-2 hover:text-greenPrimary-600"
            >
              <Mail className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
              <span className="truncate">{application.email}</span>
            </a>
            <a
              href={`tel:${application.phoneNumber}`}
              className="flex items-center gap-2 hover:text-greenPrimary-600"
            >
              <Phone className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
              {application.phoneNumber}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
              {application.address || <span className="text-neutralPrimary-400">No address given</span>}
            </p>
            <p className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0 text-greenPrimary-500" aria-hidden />
              {experience ? (
                <span>
                  <span className="font-semibold text-neutralPrimary-700">{experience}</span> experience
                </span>
              ) : (
                <span className="text-neutralPrimary-400">Experience not stated</span>
              )}
            </p>
          </div>

          {skills.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <a
          href={application.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-greenPrimary-600 px-4 py-2 text-sm font-semibold text-greenPrimary-600 transition-all hover:bg-greenPrimary-600 hover:text-white"
        >
          <FileText className="h-4 w-4" aria-hidden />
          View resume
        </a>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete application from ${application.name}`}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-destructive-50 hover:text-destructive-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          <span className="max-sm:hidden">Delete</span>
        </button>
      </div>
    </article>
  );
}
