/**
 * Operational status of a job opening. Only ACTIVE openings whose deadline has
 * not passed are served to the public storefront.
 */
export type CareerStatus = "ACTIVE" | "INACTIVE";

export type JobType = "PART_TIME" | "FULL_TIME" | "CONTRACT" | "INTERNSHIP";

export type JobLocationType = "ONSITE" | "ONLINE" | "HYBRID";

/** Admin user embedded on a career row's audit trail. */
export interface ICareerAuditUser {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  role: string;
}

/**
 * A job opening as the careers page receives it (`PublicJobDto`).
 */
export interface ICareer {
  /** Sent back as `jobId` when applying. */
  id: number;
  status: CareerStatus;

  position: string;
  slug: string;
  /** Last day to apply; the whole day counts. */
  deadline: string;
  jobType: JobType;

  jobLocationType: JobLocationType | null;
  jobLocation: string;

  /** "Negotiable" when the admin left it blank. */
  salary: string | null;

  // Rich text (HTML) blocks
  jobOverview: string | null;
  jobResponsibilities: string;
  jobRequirements: string;
  jobFacilities: string | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * A job opening as an admin receives it (`AdminJobDto`): the public fields plus
 * the application count and audit trail.
 */
export interface IAdminCareer extends ICareer {
  sid: string;
  applicationCount: number;
  createdBy?: ICareerAuditUser;
  updatedBy?: ICareerAuditUser;
}

/**
 * A candidate's submission against one job opening (`AdminApplicationDto`).
 */
export interface IApplication {
  id: number;
  sid: string;
  jobId: number;
  name: string;
  phoneNumber: string;
  email: string;
  /** Absolute URL of the uploaded resume. */
  resumeUrl: string;
  appliedAt: string;

  // Optional on the form, so null when the candidate left them out.
  address: string | null;
  yearsOfExperience: number | null;
  skills: string | null;
}

/** What the candidate gets back after applying (`PublicApplicationDto`). */
export interface IApplicationReceipt {
  sid: string;
  jobId: number;
  position: string;
  name: string;
  email: string;
  appliedAt: string;
}

/** Shape of a `<SingleSelectSearch />` option used by the career forms. */
export interface ICareerOption {
  id: string;
  name: string;
}
