/* eslint-disable react/no-unescaped-entities */
"use client";

import { logout } from "@/modules/auth/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


const Unauthorized = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(10);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Get previous page from URL params
    const previousPage = searchParams.get('from') || '/';
    const errorMessage = searchParams.get('message') || 'You are not authorized to access this resource';

    // Auto redirect to login after countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        if (isRedirecting) return;
        
        setIsRedirecting(true);
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            router.replace('/login');
        }
    };

    const handleRetry = () => {
        if (isRedirecting) return;
        
        // Try to go back to previous page
        if (previousPage && previousPage !== '/unauthorized') {
            router.replace(previousPage);
        } else {
            router.replace('/');
        }
    };

    const handleGoHome = () => {
        router.push('/');
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
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Unauthorized Access
                </h1>

                <p className="text-gray-600 mb-4">
                    {errorMessage}
                </p>

                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                    <p className="text-red-800 text-sm">
                        Your session has expired or you don't have permission to access this resource.
                    </p>
                </div>

                {/* Auto-redirect message */}
                {isRedirecting && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                        <p className="text-blue-800 text-sm">
                            Redirecting to login page...
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        disabled={isRedirecting}
                        className={`w-full py-3 px-4 rounded-md transition duration-200 font-medium ${
                            isRedirecting
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isRedirecting ? 'Redirecting...' : 'Try Again'}
                    </button>

                    <button
                        onClick={handleLogout}
                        disabled={isRedirecting}
                        className={`w-full py-3 px-4 rounded-md transition duration-200 font-medium ${
                            isRedirecting
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {isRedirecting ? 'Logging out...' : 'Logout & Login'}
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 font-medium"
                    >
                        Go to Homepage
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                    Auto redirecting to login in {countdown} seconds...
                </p>

                {/* Technical Details (for development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                        <p className="text-sm text-yellow-800">
                            <strong>Developer Note:</strong> This error occurs when:
                        </p>
                        <ul className="text-xs text-yellow-700 mt-1 text-left">
                            <li>• Access token has expired</li>
                            <li>• Invalid or malformed token</li>
                            <li>• User doesn't have required permissions</li>
                            <li>• Session has been invalidated</li>
                        </ul>
                        <p className="text-xs text-yellow-700 mt-1">
                            Previous Page: {previousPage}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Unauthorized;
