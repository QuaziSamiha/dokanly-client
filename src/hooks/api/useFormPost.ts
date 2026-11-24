/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGenericErrorResponse } from "@/types";
import { postService } from "@/modules/auth/services/auth-api.service";

export const useFormPost = <T>(
  endpoint: string,
  onSuccess?: (data: T) => void,
  onError?: (error: IGenericErrorResponse) => void
) => {
  return useMutation({
    mutationFn: (data: Record<string, unknown> | FormData) =>
      postService.requestForm(endpoint, data),
    onSuccess: (data: any) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success(data.message, {
          duration: 3000,
        });
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
        onSuccess(data);
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message);
      if (onError) {
        onError(error);
      }
    },
  });
};