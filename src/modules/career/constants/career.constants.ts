import { ICareerOption, JobLocationType, JobType } from "../types/career.types";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const JOB_LOCATION_TYPE_LABELS: Record<JobLocationType, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  ONLINE: "Remote",
};

/** Job type options for the admin add/edit career forms. */
export const JOB_TYPE_OPTIONS: ICareerOption[] = (
  Object.keys(JOB_TYPE_LABELS) as JobType[]
).map((id) => ({ id, name: JOB_TYPE_LABELS[id] }));

/** Work mode options for the admin add/edit career forms. */
export const JOB_LOCATION_TYPE_OPTIONS: ICareerOption[] = (
  Object.keys(JOB_LOCATION_TYPE_LABELS) as JobLocationType[]
).map((id) => ({ id, name: JOB_LOCATION_TYPE_LABELS[id] }));

/** Operational status options — edit form only, a new opening is always ACTIVE. */
export const JOB_STATUS_OPTIONS: ICareerOption[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];

/** A deadline this many days away (or fewer) is flagged as closing soon. */
export const CLOSING_SOON_DAYS = 5;

/** Matches the server's resume check (`APPLICATION_LIMITS.RESUME_MAX_MB`). */
export const RESUME_MAX_MB = 2;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** What the server stores when the admin leaves the salary blank. */
export const NEGOTIABLE_SALARY = "Negotiable";
