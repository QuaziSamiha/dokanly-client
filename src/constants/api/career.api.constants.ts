/**
 * Career (job opening) endpoints and react-query keys.
 *
 * `keys` holds the full query key arrays passed to `useGet` / `useGetAll`.
 * `rootKeys` holds the single key string that `useDelete` and
 * `invalidateQueries` expect.
 */
export const CAREER_API = {
  paths: {
    ALL: "/job/all-jobs",
    ACTIVE_CURRENT: "/job/active-current-jobs",
    BY_SLUG: (slug: string) => `/job/${slug}`,
    CREATE: "/job/create-job",
    UPDATE_BY_ID: (id: number | string) => `/job/update-job/${id}`,
    DELETE_BY_ID: (id: number | string) =>
      `/job/delete-job-with-applications/${id}`,
  },
  keys: {
    ALL: ["getAllJobs"] as string[],
    ACTIVE_CURRENT: ["getAllActiveCurrentJobs"] as string[],
    DETAILS: (slug: string): string[] => ["getCareerDetails", slug],
  },
  rootKeys: {
    ALL: "getAllJobs",
  },
} as const;

/**
 * Job application endpoints. Applications belong to the career domain, so they
 * live beside it rather than in a module of their own.
 */
export const CAREER_APPLICATION_API = {
  paths: {
    CREATE: "/application/create-job-application",
    BY_JOB_ID: (jobId: number | string) =>
      `/application/all-applications/${jobId}`,
    DELETE_BY_ID: (id: number | string) =>
      `/application/delete-application/${id}`,
  },
  keys: {
    BY_JOB_ID: (jobId: number | string): string[] => [
      "getAllApplications",
      String(jobId),
    ],
  },
  rootKeys: {
    ALL: "getAllApplications",
  },
} as const;
