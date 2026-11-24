import { authKey, refreshKey } from "@/modules/auth/constants/auth.constants";
import axiosInstance from "@/lib/axios/axios";
import Cookies from 'js-cookie';
import { decodedToken } from "../utils/jwt.utils";
import { useGet } from "@/hooks/api/useGet";
import { UserInfoByIdProps } from "@/types";
import { accessTokenDelete, refreshDelete } from "@/modules/auth/actions/auth.actions";
import { getBaseUrl } from "@/config/env.config";


export const getUserInfo = () => {
  const authToken = getCookie(authKey);
  // console.log(authToken);
  if (authToken) {
    const decodedData = decodedToken(authToken);
    return decodedData;
  } else {
    return "";
  }
};

export const getCookie = (key: string) => {
  return Cookies.get(key) || '';
  // const refreshToken = Cookies.get('refreshToken');
};

// ========== user full data ======

export const UserFullData = (userID: string | undefined) => {
  const { data: userInfoByid } = useGet<UserInfoByIdProps>(`/users/${userID}`, [
    "getUserInfoById",
  ]);
  return userInfoByid;
};

export const isLoggedIn = () => {
  const authToken = getCookie(authKey);
  return !!authToken;
};

/**
 * Whether this browser is carrying app credentials at all. A 401 for a visitor
 * who never had a session (a public page calling a protected endpoint) is not a
 * dead session, so it must not bounce them to the login page.
 */
export const hasStoredSession = () => {
  return !!(getCookie(authKey) || getCookie(refreshKey));
};


/**
 * A burst of parallel requests can all fail auth at once. Without this latch
 * each one clears the cookies and starts its own navigation, and the redirects
 * cancel each other out — leaving the user exactly where they were.
 */
let isEndingSession = false;

export async function logout(redirectTo: string = '/') {
  if (isEndingSession) return;
  isEndingSession = true;

  try {
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    await refreshDelete();
    await accessTokenDelete();
    localStorage.removeItem(authKey);
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    window.location.href = redirectTo; // Force full page reload
  }
}

/**
 * The session died underneath a page the user is already sitting on — expired,
 * revoked, or signed with a secret the API no longer accepts. Only the client
 * can notice: middleware just decodes the cookie, which still parses and can
 * still look unexpired, so it keeps serving the admin shell while every request
 * behind it 401s. Clear the credentials and send the user to the login page
 * instead of leaving them on a screen that can only render errors.
 */
export async function endExpiredSession() {
  if (typeof window === 'undefined' || isEndingSession) return;

  // Nothing to end — an anonymous visitor hitting a protected endpoint should
  // just see the failed request, not get thrown at the login page.
  if (!hasStoredSession()) return;

  await logout('/login?sessionExpired=1');
}

export const getNewAccessToken = async () => {
  const refreshToken = Cookies.get('refreshToken'); // Get from client-side cookies

  console.log("refreshToken", refreshToken);

  return axiosInstance({
    url: `${getBaseUrl()}/auth/refresh`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    data: { refreshToken }, // Send refresh token in body
  });
};