"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNetworkStatus } from "@/hooks/network/useNetworkStatus";

/**
 * Detects whether the user is online or offline
 * Shows different messages for network errors, server errors, or general errors
 * Lets the user retry or go home
 * Automatically redirects them back to where they came from when network is restored
 */

export default function Error() {
  const router = useRouter();
  const searchParams = useSearchParams(); //? Reads query parameters (e.g. ?type=network&from=/dashboard)
  const isOnline = useNetworkStatus(); //?  CUSTOM HOOK
  const [retryCount, setRetryCount] = useState(0); //? Keeps track of how many times user clicked “Retry”
  const [isRedirecting, setIsRedirecting] = useState(false); //? Prevents multiple auto-redirects once network is restored

  // Get error details from URL params
  const errorType = searchParams.get("type") || "general"; //? network / server / general - Controls which icon + message to show
  const previousPage = searchParams.get("from") || "/"; //? The page user came from, used for redirection

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    if (isOnline) {
      router.back(); // Go back to previous page
    } else {
      router.refresh(); // Refresh the current page
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  //? Auto-redirect when network is restored
  useEffect(() => {
    if (isOnline && !isRedirecting) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        // Try to go back to previous page, fallback to home
        if (previousPage && previousPage !== "/error") {
          router.replace(previousPage);
        } else {
          router.replace("/");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, router, previousPage, isRedirecting]);

  const getErrorContent = () => {
    switch (errorType) {
      case "network":
        return {
          title: "Network Connection Lost",
          message: "Please check your internet connection and try again.",
          icon: (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
              />
            </svg>
          ),
        };
      case "server":
        return {
          title: "Server Error",
          message:
            "The server is temporarily unavailable. Please try again later.",
          icon: (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          ),
        };
      default:
        return {
          title: "Something Went Wrong",
          message: "We encountered an unexpected error. Please try again.",
          icon: (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          {errorContent.icon}
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorContent.title}
        </h1>

        <p className="text-gray-600 mb-6">{errorContent.message}</p>

        {/* Auto-redirect message */}
        {isOnline && isRedirecting && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800 text-sm">
              Network restored! Redirecting you back in a moment...
            </p>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={!isOnline && errorType === "network"}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              !isOnline && errorType === "network"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {retryCount > 0 ? `Retry Again (${retryCount})` : "Try Again"}
          </button>

          <button
            onClick={handleGoHome}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>

        {/* Technical Details (for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-gray-100 rounded-md text-left">
            <p className="text-xs text-gray-600 mb-1">Technical Details:</p>
            <p className="text-xs text-gray-500">Error Type: {errorType}</p>
            <p className="text-xs text-gray-500">
              Previous Page: {previousPage}
            </p>
            <p className="text-xs text-gray-500">
              Network Status: {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * When user lands on:  /error?type=network&from=/dashboard
 * Component renders → checks URL params
 * errorType = "network" → shows red Wi-Fi-like icon and message
 * useNetworkStatus() checks if online/offline

- If the user is offline:
  - Status dot = “Offline”
  - “Try Again” button is disabled
  - Page shows: “Please check your connection”

- When the user comes back online:
  - isOnline becomes true
  - useEffect triggers → sets a 2-second timer
  - Message appears: “Network restored! Redirecting…”
  - After 2 seconds → redirects to /dashboard (the from param)

- If the user clicks “Try Again”
  - Retry counter increases
  - If online → goes back (router.back())
  - If offline → refreshes same error page

- If user clicks “Go Home”
  - Redirects to /
 */
