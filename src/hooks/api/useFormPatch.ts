import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGenericErrorResponse, ApiResponse } from "@/types";
import { postService } from "@/modules/auth/services/auth-api.service";

export const useFormPatch = <T>(
  onSuccess?: (data: ApiResponse<T>) => void,
  onError?: (error: IGenericErrorResponse) => void
) => {
  return useMutation<
    ApiResponse<T>,
    IGenericErrorResponse,
    { endpoint: string; data: Record<string, unknown> | FormData }
  >({
    mutationFn: async ({ endpoint, data }) => {
      const response = await postService.requestFormPatch(endpoint, data);
      return response as ApiResponse<T>;
    },
    onSuccess: (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success(data.message ?? "Update successful!", { className: "toast-update" });
      } else {
        toast.error(data.message ?? "Update failed");
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update.");
      onError?.(error);
    },
  });
};
