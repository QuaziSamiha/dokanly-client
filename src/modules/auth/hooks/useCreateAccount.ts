
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { postService } from "@/modules/auth/services/auth-api.service";

export const useCreateAccount = <T extends ResponseSuccessType>(
  endpoint: string,
  onSuccess?: (data: T) => void,
  onError?: (error: IGenericErrorResponse) => void
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
