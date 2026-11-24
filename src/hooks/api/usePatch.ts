import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGenericErrorResponse, ApiResponse } from "@/types";
import { postService } from "@/modules/auth/services/auth-api.service";

export const usePatch = <T>(
  onSuccess?: (data: ApiResponse<T>) => void,
  onError?: (error: IGenericErrorResponse) => void
) => {
  return useMutation<
    ApiResponse<T>,
    IGenericErrorResponse,
    { endpoint: string; data: Record<string, unknown> }
  >({
    mutationFn: async ({ endpoint, data }) => {
      const response = await postService.patch(endpoint, data);
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

// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { IGenericErrorResponse } from "@/types";
// import { postService } from "@/modules/auth/services/auth-api.service";
// import { ApiResponse } from "@/types";

// export const usePatch = <T>(
//   onSuccess?: (data: T) => void,
//   onError?: (error: IGenericErrorResponse) => void
// ) => {
//   return useMutation({
//     mutationFn: ({
//       endpoint,
//       data,
//     }: {
//       endpoint: string;
//       data: Record<string, unknown>;
//     }) => postService.patch(endpoint, data),
//     onSuccess: (data: ApiResponse<T>) => {
//       console.log(data)
//       if (data.statusCode >= 200 && data.statusCode < 300) {
//         toast.success(data.message ?? "Update successful!");
//       } else {
//         toast.error(data.message ?? "Update failed");
//       }
//       onSuccess?.(data);
//     },
//     onError: (error: IGenericErrorResponse) => {
//       toast.error(error.message || "Failed to update.");
//       onError?.(error);
//     },
//   });
// };
