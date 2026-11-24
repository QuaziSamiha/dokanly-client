"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { postService } from "@/modules/auth/services/auth-api.service";

export const usePost = <T extends ResponseSuccessType>(
  endpoint: string,
  onSuccess?: (data: T) => void,
  onError?: (error: IGenericErrorResponse) => void,
) => {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      postService.request(endpoint, data) as Promise<ResponseSuccessType>,
    onSuccess: (data: ResponseSuccessType) => {
      console.log("toast message =>", data);

      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success(data.message);
      } else if (data.statusCode >= 400 && data.statusCode < 500) {
        if (Array.isArray(data.message)) {
          data.message.forEach((message: string) => {
            toast.error(message);
          });
        } else {
          toast.error(data.message ?? "Create failed");
        }
      } else {
        toast.error("Something went wrong. Please try again later.");
      }

      if (onSuccess) {
        onSuccess(data as T);
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message);
      if (onError) onError(error);
    },
  });
};

// import { postAPI } from "@/lib/axios/api";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { toast } from "react-hot-toast";

// export interface IUsePost {
//   endpoint: string;
//   queryKey?: string[];
//   options?: { onSuccess?: () => void };
// }
// export function usePost<T>({ endpoint, queryKey, options }: IUsePost) {
//   const queryClient = useQueryClient();
//   const mutation = useMutation({
//     mutationFn: (payload: T) => postAPI({ endpoint, payload }),
//     onSuccess: (response) => {
//       toast.success(response?.data?.message || "Success!");
//       if (queryKey) {
//         queryClient.invalidateQueries({ queryKey: queryKey }); // to refresh cached data.
//       }
//       if (options?.onSuccess) options.onSuccess();
//     },
//     onError: (error: AxiosError) => {
//       toast.error(error.message || "Something went wrong!");
//     },
//   });
//   return mutation;
// }
