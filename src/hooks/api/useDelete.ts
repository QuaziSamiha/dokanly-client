import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { axiosInstance } from "@/lib/axios/axiosInstance";

export const useDelete = (queryKeyToInvalidate?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endpoint: string) => {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Deleted successfully.", { className: "toast-delete" });
      if (queryKeyToInvalidate) {
        queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] });
      }
    },
    onError: (error: AxiosError) => {
      toast.error(error?.message || error.message || "Failed to delete.");
    },
  });
};

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import type { AxiosError } from "axios";
// import { axiosInstance } from "@/lib/axios/axiosInstance";

// export const useDelete = (endpoint: string, queryKeyToInvalidate?: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       const response = await axiosInstance.delete(endpoint);
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Deleted successfully.");
//       if (queryKeyToInvalidate) {
//         // Invalidate the cache for cart so it refetches automatically
//         queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] });
//       }
//     },
//     onError: (error: AxiosError) => {
//       toast.error(error.message || "Failed to delete.");
//     },
//   });
// };


// export const useDelete = (endpoint: string, queryKeyToInvalidate?: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       const response = await axiosInstance.delete(endpoint);
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Deleted successfully.");
//       if (queryKeyToInvalidate) {
//         // Invalidate the cache for cart so it refetches automatically
//         queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] });
//       }
//     },
//     onError: (error: AxiosError) => {
//       toast.error(error.message || "Failed to delete.");
//     },
//   });
// };
// hooks/api/useDelete.ts
