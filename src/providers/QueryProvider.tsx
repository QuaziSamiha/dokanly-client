"use client";

import { IGenericErrorResponse } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";

/**
 * 4xx responses are verdicts, not hiccups. Retrying an expired session or a
 * forbidden resource just multiplies the failed requests (and the toasts) while
 * the sign-out redirect is already on its way, so only server/network faults
 * are worth a second attempt.
 */
function shouldRetry(failureCount: number, error: unknown) {
  const statusCode = (error as IGenericErrorResponse)?.statusCode;

  if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
    return false;
  }

  return failureCount < 2;
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Held in state so a re-render doesn't hand the tree a brand-new client —
  // that would drop the cache and refire every query on the screen.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: shouldRetry },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
