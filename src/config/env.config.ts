const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/n-care/api/v1";

/**
 * The browser always uses the public API URL, which is baked in at build time.
 *
 * Code running *inside* the Next server cannot always reach that URL: in Docker
 * the public hostname may not resolve from within the container, and
 * `localhost` there means the Next container itself, not the API. So server-side
 * calls prefer INTERNAL_API_BASE_URL (e.g. http://server:5001/n-care/api/v1)
 * when it is set, and fall back to the public URL when it is not — which is
 * exactly the previous behaviour outside Docker.
 */
export const getBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_BASE_URL || PUBLIC_API_BASE_URL;
  }

  return PUBLIC_API_BASE_URL;
};

export const NEXTAUTH_URL =
  process.env.NEXTAUTH_URL || "https://naturacarebd.com/";
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
//* ====== 3rd party service credentials ======
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
//* ====== google analytics, facebook pixel, google tag manager ======
export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
// * LEGACY: direct GA4 Measurement ID — GA4 is now configured inside the GTM container instead. Kept for rollback safety.
// export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// =========== GOOGLE ANALYTICS DATA API (for admin dashboard) ==============
export const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
export const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
export const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
