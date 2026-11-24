// "use client";

import { axiosInstance } from "@/lib/axios/axiosInstance";
import { IGenericErrorResponse } from "@/types";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

// import { getAPI } from "@/lib/axios/api";
// import { useQuery } from "@tanstack/react-query";

// interface IUseGet {
//   queryKey: string[];
//   endpoint: string;
// }

// export function useGet({ endpoint, queryKey }: IUseGet) {
//   const queryResult = useQuery({
//     queryKey: queryKey,
//     queryFn: () => getAPI(endpoint),
//   });
//   return queryResult;
// }

type CustomQueryOptions<T> = Omit<
  UseQueryOptions<T, IGenericErrorResponse, T, QueryKey>,
  "queryKey" | "queryFn"
>;

export const useGet = <T>(
  endpoint: string,
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  shouldFetch: boolean = true,
  options?: CustomQueryOptions<T>
) => {
  return useQuery<T, IGenericErrorResponse>({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(endpoint, {
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch data.");
        } else {
          toast.error("Failed to fetch data.");
        }
        throw error;
      }
    },
    enabled: shouldFetch,
    ...options,
  });
};

export const useGetAll = <T>(
  endpoint: string,
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  options?: CustomQueryOptions<T>,
  shouldFetch: boolean = true
) => {
  return useQuery<T, IGenericErrorResponse>({
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        const response = await axiosInstance.get<T>(endpoint, {
          params: queryParams,
        });
        return response as T;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch data.");
        } else {
          toast.error("Failed to fetch data.");
        }
        throw error;
      }
    },
    enabled: shouldFetch,
    ...options,
  });
};
