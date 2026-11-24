import { accessTokenCreate, refreshCreate } from "@/modules/auth/actions/auth.actions";
import { authService } from "@/modules/auth/services/auth-api.service";
import { IGenericErrorResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAuth = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      try {
        // Store user info and refresh token
        await Promise.all([
          refreshCreate(data.refresh_token),
          accessTokenCreate(data.access_token),
          // storeUserInfo({ accessToken: data.access_token }),
        ]);

        // Show success message
        // * `data` is the unwrapped token payload, so the envelope's message is gone.
        toast.success(data.message ?? "Login successful!");

        // Execute the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error in onSuccess:", error);
        toast.error("An error occurred while processing your request.");
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message);
    },
  });
};