"use client";

import { CAREER_APPLICATION_API } from "@/constants/api";
import { useDelete } from "@/hooks/api/useDelete";
import { useFormPost } from "@/hooks/api/useFormPost";
import { useGet } from "@/hooks/api/useGet";
import { ResponseSuccessType } from "@/types";
import { IApplication, IApplicationReceipt } from "../types/career.types";

/**
 * Applications filed against one job opening, newest first. `search` matches
 * the name, email and phone number on the server. Skips the request until a
 * job is actually selected in the admin table.
 */
export function useCareerApplications(jobId?: number, search?: string) {
  const term = search?.trim() || undefined;
  const { data, isLoading, isFetching, refetch } = useGet<IApplication[]>(
    CAREER_APPLICATION_API.paths.BY_JOB_ID(jobId ?? 0),
    [...CAREER_APPLICATION_API.keys.BY_JOB_ID(jobId ?? 0), term ?? ""],
    { search: term },
    Boolean(jobId),
  );

  return {
    applications: data ?? [],
    isApplicationsLoading: isLoading,
    isApplicationsFetching: isFetching,
    refetchApplications: refetch,
  };
}

export function useDeleteApplication() {
  const { mutate, isPending } = useDelete(CAREER_APPLICATION_API.rootKeys.ALL);

  const deleteApplication = (id: number, onSuccess?: () => void) =>
    mutate(CAREER_APPLICATION_API.paths.DELETE_BY_ID(id), { onSuccess });

  return { deleteApplication, isDeletingApplication: isPending };
}

/**
 * Public side — a candidate applying to an opening. Multipart, because the
 * resume rides along with the form fields. `onSuccess` receives the receipt.
 */
export function useApplyToJob(
  onSuccess?: (receipt: IApplicationReceipt) => void,
) {
  const { mutate, isPending } = useFormPost(
    CAREER_APPLICATION_API.paths.CREATE,
    (data: unknown) => {
      const response = data as ResponseSuccessType;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        onSuccess?.(response.data as IApplicationReceipt);
      }
    },
  );

  return { applyJob: mutate, isApplying: isPending };
}
