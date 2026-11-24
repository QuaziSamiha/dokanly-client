"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBaseUrl } from "@/config/env.config";
import { useNetworkStatus } from "@/hooks/network/useNetworkStatus";

const NetworkError = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useNetworkStatus();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  // Get previous page from URL params
  const previousPage = searchParams.get("from") || "/";

  // Function to check server connectivity
  const checkServerConnectivity = async () => {
    if (isCheckingServer) return false;

    setIsCheckingServer(true);
    try {
      // First check if the frontend server is running
      const frontendHealthResponse = await fetch(
        "http://localhost:5001/n-care/api/v1/health",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Short timeout for quick check
          signal: AbortSignal.timeout(3000),
        }
      );

      if (!frontendHealthResponse.ok) {
        setIsServerOnline(false);
        return false;
      }

      // Then check if the backend server is running
      const baseUrl = getBaseUrl();
      const backendResponse = await fetch(`${baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Short timeout for quick check
        signal: AbortSignal.timeout(3000),
      });

      const isServerUp = backendResponse.ok;
      setIsServerOnline(isServerUp);

      return isServerUp;
    } catch (error) {
      console.log("Server check failed:", error);
      setIsServerOnline(false);
      return false;
    } finally {
      setIsCheckingServer(false);
    }
  };

  // Auto-redirect when both network and server are restored
  useEffect(() => {
    if (isOnline && !isRedirecting) {
      // Check server connectivity first
      checkServerConnectivity().then((serverIsUp) => {
        if (serverIsUp) {
          setIsRedirecting(true);
          const timer = setTimeout(() => {
            // Try to go back to previous page, fallback to home
            if (previousPage && previousPage !== "/network-error") {
              router.replace(previousPage);
            } else {
              router.replace("/");
            }
          }, 2000);

          return () => clearTimeout(timer);
        }
      });
    }
  }, [isOnline, router, previousPage, isRedirecting]);

  // Periodically check server when online but server is down
  useEffect(() => {
    if (isOnline && !isServerOnline && !isRedirecting) {
      const interval = setInterval(() => {
        checkServerConnectivity();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isOnline, isServerOnline, isRedirecting]);

  // Auto-check server connectivity every 5 seconds when network is restored
  useEffect(() => {
    if (isOnline && !isRedirecting) {
      const interval = setInterval(() => {
        checkServerConnectivity().then((serverIsUp) => {
          if (serverIsUp && !isRedirecting) {
            setIsRedirecting(true);
            // Auto redirect after 2 seconds when server is back online
            setTimeout(() => {
              if (previousPage && previousPage !== "/network-error") {
                router.replace(previousPage);
              } else {
                router.replace("/");
              }
            }, 2000);
          }
        });
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isOnline, isRedirecting, router, previousPage]);

  // Fallback auto redirect to home after countdown
  useEffect(() => {
    if (!isOnline) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [router, isOnline]);

  const handleRetry = async () => {
    if (isCheckingServer) return;

    const serverIsUp = await checkServerConnectivity();

    if (serverIsUp) {
      // If server is up, redirect back to previous page
      if (previousPage && previousPage !== "/network-error") {
        router.replace(previousPage);
      } else {
        router.replace("/");
      }
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {!isOnline ? "Network Connection Lost" : "Server Connection Issue"}
        </h1>

        <p className="text-gray-600 mb-4">
          {!isOnline
            ? "Unable to connect to the internet. This usually means:"
            : "Unable to connect to the server. This usually means:"}
        </p>

        <ul className="text-sm text-gray-600 text-left mb-6 space-y-2">
          {!isOnline ? (
            <>
              <li>• No internet connection</li>
              <li>• WiFi or mobile data is disabled</li>
              <li>• Network connectivity issue</li>
              <li>• DNS resolution problems</li>
            </>
          ) : (
            <>
              <li>• Backend server is not running</li>
              <li>• Server is restarting</li>
              <li>• Server is overloaded</li>
              <li>• Database connection issues</li>
            </>
          )}
        </ul>

        {/* Auto-redirect message */}
        {isOnline && isServerOnline && isRedirecting && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800 text-sm">
              Server is back online! Redirecting you back in a moment...
            </p>
          </div>
        )}

        {/* Server checking message */}
        {isOnline && !isServerOnline && isCheckingServer && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-blue-800 text-sm">Checking server status...</p>
          </div>
        )}

        {/* Server offline but network online */}
        {isOnline && !isServerOnline && !isCheckingServer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              Network is online but server is not responding. Checking every 5
              seconds...
            </p>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"
                }`}></div>
            <span className="text-sm text-gray-600">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {isOnline && (
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${isServerOnline ? "bg-green-500" : "bg-red-500"
                  }`}></div>
              <span className="text-sm text-gray-600">
                Server {isServerOnline ? "Online" : "Offline"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={!isOnline || isCheckingServer}
            className={`w-full py-3 px-4 rounded-md transition duration-200 font-medium ${!isOnline || isCheckingServer
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}>
            {isCheckingServer ? "Checking..." : "Try Again"}
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 font-medium">
            Go to Homepage
          </button>
        </div>

        {!isOnline && (
          <p className="text-sm text-gray-500 mt-4">
            Auto redirecting to homepage in {countdown} seconds...
          </p>
        )}

        {/* Technical Details (for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Developer Note:</strong>
              {!isOnline
                ? " Check your internet connection and network settings."
                : " Check if your backend server is running and accessible."}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Previous Page: {previousPage}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Server Status: {isServerOnline ? "Online" : "Offline"}
              {isCheckingServer && " (Checking...)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkError;