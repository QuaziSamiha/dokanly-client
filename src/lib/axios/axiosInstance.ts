// import axios from "axios";
// import { getCookie, getNewAccessToken, logout } from "@/modules/auth/services/auth.service";
// import { authKey } from "@/modules/auth/constants/auth.constants";
// import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
// import { getBaseUrl } from "@/config/env.config";
// import { toast } from "sonner";
// import { accessTokenCreate } from "@/modules/auth/actions/auth.actions";
// import { redirectToErrorPage, getErrorType } from "@/lib/utils/error.utils";

// const instance = axios.create({
//     baseURL: getBaseUrl(),
//     withCredentials: true,
// });

// instance.defaults.headers.post["Content-Type"] = "application/json";
// instance.defaults.headers["Accept"] = "application/json";
// instance.defaults.timeout = 60000;

// // Track refresh token requests to prevent loops
// let isRefreshing = false;
// let refreshSubscribers: ((token: string) => void)[] = [];

// function onRefreshed(token: string) {
//     refreshSubscribers.forEach(callback => callback(token));
//     refreshSubscribers = [];
// }

// function addRefreshSubscriber(callback: (token: string) => void) {
//     refreshSubscribers.push(callback);
// }

// // Request interceptor
// instance.interceptors.request.use(
//     function (config) {
//         // Reset redirect flag when making new requests (not to error pages)
//         if (config.url && !config.url.includes('/error') && !config.url.includes('/network-error')) {
//             isRedirectingToError = false;
//         }

//         // Skip adding Authorization header for login and refresh endpoints
//         if (!config.url?.includes("/auth/login") && !config.url?.includes("/auth/refresh")) {
//             const accessToken = getCookie(authKey);
//             if (accessToken) {
//                 config.headers.Authorization = `Bearer ${accessToken}`;
//             }
//         }
//         return config;
//     },
//     function (error) {
//         return Promise.reject(error);
//     }
// );

// // Track if we're already redirecting to prevent loops
// let isRedirectingToError = false;

// // Response interceptor
// instance.interceptors.response.use(
//     // @ts-expect-error: response type is not always consistent
//     function (response) {
//         const responseObject: ResponseSuccessType = {
//             statusCode: response?.data?.statusCode,
//             success: response?.data?.success,
//             message: response?.data?.message,
//             data: response?.data?.data,
//             meta: response?.data?.meta,
//         };
//         return responseObject;
//     },
//     async function (error) {
//         const originalRequest = error.config;

//         // Network error or no response
//         if (!error.response) {
//             const errorType = getErrorType(error);

//             if (errorType === 'network' && typeof window !== 'undefined' && !isRedirectingToError) {
//                 isRedirectingToError = true;
//                 redirectToErrorPage({ type: 'network' });
//             }

//             const responseObject: IGenericErrorResponse = {
//                 statusCode: 503,
//                 message: "Network error. Please check your connection.",
//                 errorMessages: "Network error. Please check your connection.",
//             };
//             return Promise.reject(responseObject);
//         }

//         const status = error.response?.status;
//         const errorMessage = error.response?.data?.message || "An error occurred";

//         // Handle 401 Unauthorized
//         if (status === 401) {
//             // Prevent infinite retry loops
//             if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
//                 console.log("Logging out due to auth failure");
//                 // Redirect to unauthorized page instead of just logging out
//                 if (typeof window !== 'undefined' && !isRedirectingToError) {
//                     isRedirectingToError = true;
//                     redirectToErrorPage({ type: 'unauthorized', from: window.location.pathname });
//                 }
//                 logout();
//                 return Promise.reject(error);
//             }

//             originalRequest._retry = true;

//             // Token expired - try to refresh
//             if (errorMessage.includes("jwt expired") || errorMessage.includes("Token expired")) {
//                 if (!isRefreshing) {
//                     isRefreshing = true;

//                     try {
//                         console.log("Attempting to refresh token...");
//                         const response = await getNewAccessToken();
//                         const newAccessToken = response.data.access_token;

//                         console.log("New access token received");

//                         // Update token in cookies/storage
//                         accessTokenCreate(newAccessToken);
//                         document.cookie = `accessToken=${newAccessToken}; path=/; secure; samesite=lax`;

//                         // Update Authorization header
//                         instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//                         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

//                         // Notify all waiting requests
//                         onRefreshed(newAccessToken);

//                         // Retry the original request
//                         return instance(originalRequest);
//                     } catch (refreshError) {
//                         console.error("Token refresh failed:", refreshError);
//                         // Clear all subscribers and redirect to unauthorized page
//                         refreshSubscribers = [];
//                         if (typeof window !== 'undefined' && !isRedirectingToError) {
//                             isRedirectingToError = true;
//                             redirectToErrorPage({ type: 'unauthorized', from: window.location.pathname });
//                         }
//                         logout();
//                         return Promise.reject(refreshError);
//                     } finally {
//                         isRefreshing = false;
//                     }
//                 } else {
//                     // If already refreshing, wait for the new token
//                     return new Promise((resolve) => {
//                         addRefreshSubscriber((token: string) => {
//                             originalRequest.headers['Authorization'] = `Bearer ${token}`;
//                             resolve(instance(originalRequest));
//                         });
//                     });
//                 }
//             }
//             // Invalid refresh token or other auth issues
//             else if (errorMessage.includes("Invalid refresh token") ||
//                 errorMessage.includes("Invalid token") ||
//                 errorMessage.includes("Unauthorized")) {
//                 console.error("Authentication invalid, redirecting to unauthorized page");
//                 if (typeof window !== 'undefined' && !isRedirectingToError) {
//                     isRedirectingToError = true;
//                     redirectToErrorPage({ type: 'unauthorized', from: window.location.pathname });
//                 }
//                 logout();
//                 return Promise.reject(error);
//             }
//         }

//         // Handle 403 Forbidden


//         else if (status === 403) {
//             console.error("403: Forbidden");
//             toast.error("You do not have permission to access this resource");

//             const responseObject: IGenericErrorResponse = {
//                 statusCode: 403,
//                 message: errorMessage,
//                 errorMessages: errorMessage,
//             };
//             return Promise.reject(responseObject);
//         }

//         // Handle 400 Bad Request
//         else if (status === 400) {
//             if (errorMessage.includes("Invalid refresh token")) {
//                 console.log("Invalid refresh token detected");
//                 logout();
//                 return Promise.reject(error);
//             }
//         }

//         // Handle server errors (500, 502, 503, 504)
//         if (status >= 500 && status <= 599) {
//             if (typeof window !== 'undefined' && !isRedirectingToError) {
//                 isRedirectingToError = true;
//                 redirectToErrorPage({ type: 'server' });
//             }
//         }

//         // Handle other errors
//         const responseObject: IGenericErrorResponse = {
//             statusCode: error.response?.data?.statusCode || status || 500,
//             message: error.response?.data?.message || "Something went wrong",
//             errorMessages: error.response?.data?.error || errorMessage,
//         };

//         return Promise.reject(responseObject);
//     }
// );

// export { instance as axiosInstance };





import axios from "axios";
import {
    endExpiredSession,
    getCookie,
    getNewAccessToken,
} from "@/modules/auth/services/auth.service";
import { authKey, refreshKey } from "@/modules/auth/constants/auth.constants";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { getBaseUrl } from "@/config/env.config";
import { toast } from "sonner";
import { accessTokenCreate, refreshCreate } from "@/modules/auth/actions/auth.actions";
import { getErrorType, redirectToErrorPage } from "@/lib/utils/error.utils";

const instance = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;

/**
 * Endpoints where a 401 is the *answer* ("those credentials are wrong"), not a
 * symptom of a dead session. Tearing the session down here would hide the real
 * error from the login form.
 */
const CREDENTIAL_ENDPOINTS = ["/auth/login", "/auth/social-auth"];

// Track refresh token requests to prevent loops
let isRefreshing = false;
let refreshSubscribers: {
    resolve: (token: string) => void;
    reject: (reason: unknown) => void;
}[] = [];

/**
 * `getNewAccessToken` goes through the *plain* axios instance (`lib/axios/axios`),
 * which has no response interceptor — so `response.data` is the untouched
 * `sendResponse` envelope `{ statusCode, success, message, data: { ... } }` and
 * the tokens sit one level deeper than on every intercepted call. Reading the
 * wrong level yields `undefined`, which is then written to the cookie and turns
 * every later request into a 401 loop, so both shapes are handled here.
 */
function extractTokens(refreshResponse: unknown) {
    const body = (refreshResponse as { data?: Record<string, unknown> })?.data;
    const payload = (body?.data as Record<string, unknown>) ?? body ?? {};

    const accessToken = payload.access_token;
    const refreshToken = payload.refresh_token;

    return {
        accessToken: typeof accessToken === "string" ? accessToken : undefined,
        refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    };
}

function onRefreshed(token: string) {
    const waiting = refreshSubscribers;
    refreshSubscribers = [];
    waiting.forEach(({ resolve }) => resolve(token));
}

/**
 * Waiters have to be *rejected*, not merely dropped. Clearing the list without
 * settling their promises left every queued request pending forever, so screens
 * that fired several calls at once sat on their loading skeletons with no error
 * and no way out.
 */
function onRefreshFailed(reason: unknown) {
    const waiting = refreshSubscribers;
    refreshSubscribers = [];
    waiting.forEach(({ reject }) => reject(reason));
}

function addRefreshSubscriber(subscriber: {
    resolve: (token: string) => void;
    reject: (reason: unknown) => void;
}) {
    refreshSubscribers.push(subscriber);
}

/** Normalises an axios failure into the error shape the app's hooks expect. */
function toGenericError(error: {
    response?: {
        status?: number;
        data?: { statusCode?: number; message?: string; error?: string };
    };
}): IGenericErrorResponse {
    const status = error?.response?.status ?? 500;
    const message = error?.response?.data?.message || "Something went wrong";

    return {
        statusCode: error?.response?.data?.statusCode || status,
        message,
        errorMessages: error?.response?.data?.error || message,
    };
}

// Request interceptor
instance.interceptors.request.use(
    function (config) {
        // Reset redirect flag when making new requests (not to error pages)
        if (config.url && !config.url.includes('/error') && !config.url.includes('/network-error')) {
            isRedirectingToError = false;
        }

        // Skip adding Authorization header for login and refresh endpoints
        if (!config.url?.includes("/auth/login") && !config.url?.includes("/auth/refresh")) {
            const accessToken = getCookie(authKey);
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Track if we're already redirecting to prevent loops
let isRedirectingToError = false;

// Response interceptor
instance.interceptors.response.use(
    // @ts-expect-error: response type is not always consistent
    function (response) {
        const responseObject: ResponseSuccessType = {
            statusCode: response?.data?.statusCode,
            success: response?.data?.success,
            message: response?.data?.message,
            data: response?.data?.data,
            meta: response?.data?.meta,
        };
        return responseObject;
    },
    async function (error) {
        const originalRequest = error.config;

        // Network error or no response
        if (!error.response) {
            const errorType = getErrorType(error);

            if (errorType === 'network' && typeof window !== 'undefined' && !isRedirectingToError) {
                isRedirectingToError = true;
                redirectToErrorPage({ type: 'network' });
            }

            const responseObject: IGenericErrorResponse = {
                statusCode: 503,
                message: "Network error. Please check your connection.",
                errorMessages: "Network error. Please check your connection.",
            };
            return Promise.reject(responseObject);
        }

        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "An error occurred";

        // Handle 401 Unauthorized
        if (status === 401) {
            const requestUrl: string = originalRequest?.url ?? "";
            const isCredentialCheck = CREDENTIAL_ENDPOINTS.some((endpoint) =>
                requestUrl.includes(endpoint),
            );

            /**
             * Any 401 outside the credential endpoints means this session can no
             * longer talk to the API — and *why* is not something the client can
             * read off the message. The API says "jwt expired" for an expired
             * token, "invalid signature" once the signing secret has rotated,
             * "No auth token" when the cookie is gone, and otherwise passes
             * through whatever passport reports. Matching on those strings meant
             * an unrecognised one fell through every branch: no refresh, no
             * logout, no redirect — so the user sat on the admin screen while it
             * re-fired the same doomed request. Status is the signal; the message
             * is only a hint about whether a refresh is worth attempting.
             */
            if (!isCredentialCheck) {
                const isRefreshCall = requestUrl.includes("/auth/refresh");
                const canRetry =
                    !isRefreshCall &&
                    !originalRequest._retry &&
                    !!getCookie(refreshKey);

                if (!canRetry) {
                    console.log("Session is no longer valid — signing out");
                    await endExpiredSession();
                    return Promise.reject(toGenericError(error));
                }

                originalRequest._retry = true;

                if (isRefreshing) {
                    // A refresh is already in flight — queue behind it instead of
                    // starting a second one.
                    return new Promise((resolve, reject) => {
                        addRefreshSubscriber({
                            resolve: (token: string) => {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                resolve(instance(originalRequest));
                            },
                            reject,
                        });
                    });
                }

                isRefreshing = true;

                try {
                    console.log("Attempting to refresh token...");
                    const response = await getNewAccessToken();
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                        extractTokens(response);

                    if (!newAccessToken) {
                        throw new Error("Refresh response carried no access token");
                    }

                    console.log("New access token received");

                    // Update token in cookies/storage. Awaited, so the cookie
                    // is in place before the original request is replayed.
                    await accessTokenCreate(newAccessToken);
                    // `/auth/refresh` rotates the refresh token too — keep the
                    // stored one in step or the next refresh replays a stale token.
                    if (newRefreshToken) {
                        await refreshCreate(newRefreshToken);
                    }
                    const secureFlag =
                        window.location.protocol === "https:" ? " secure;" : "";
                    document.cookie = `accessToken=${newAccessToken}; path=/;${secureFlag} samesite=lax`;

                    // Update Authorization header
                    instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Notify all waiting requests
                    onRefreshed(newAccessToken);

                    // Retry the original request
                    return instance(originalRequest);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // Settle every queued request before leaving, then sign out.
                    onRefreshFailed(refreshError);
                    await endExpiredSession();
                    return Promise.reject(toGenericError(error));
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Handle 403 Forbidden
        else if (status === 403) {
            console.error("403: Forbidden");
            toast.error("You do not have permission to access this resource");

            const responseObject: IGenericErrorResponse = {
                statusCode: 403,
                message: errorMessage,
                errorMessages: errorMessage,
            };
            return Promise.reject(responseObject);
        }

        // Handle 400 Bad Request
        else if (status === 400) {
            if (errorMessage.includes("Invalid refresh token")) {
                console.log("Invalid refresh token detected");
                await endExpiredSession();
                return Promise.reject(toGenericError(error));
            }
        }

        // Handle server errors (500, 502, 503, 504)
        if (status >= 500 && status <= 599) {
            if (typeof window !== 'undefined' && !isRedirectingToError) {
                isRedirectingToError = true;
                redirectToErrorPage({ type: 'server' });
            }
        }

        // Handle other errors
        const responseObject: IGenericErrorResponse = {
            statusCode: error.response?.data?.statusCode || status || 500,
            message: error.response?.data?.message || "Something went wrong",
            errorMessages: error.response?.data?.error || errorMessage,
        };

        return Promise.reject(responseObject);
    }
);

export { instance as axiosInstance };
