import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  email: string;
  role: string;
}

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/about-us",
  "/product",
  "/media-news",
  "/media-news-details",
  "/career",
  "/contact-us",
  "/create-account",
  "/product-details",
  "/career-details",
  // "/otp-verification",
  // "/my-cart",
  // "/check-out",
  "/all-promotions",
  "/support/term-conditions",
  "/support/shipping-delivery",
  "/support/returns-exchanges",
  "/support/privacy-security",
];

// Matched with startsWith, so "/my-account" covers every account page
// (overview, orders and /my-account/order/<id>, wishlist, addresses, details).
// The first entry is where a customer lands after signing in.
const CUSTOMER_ROUTES = ["/my-account"];

const GUEST_CUSTOMER_ONLY_ROUTES = ["/my-cart", "/check-out"];

const ADMIN_ONLY_ROUTES = [
  "/dashboard",
  "/analytics",
  "/home-content",
  "/products",
  "/inventory",
  "/order-list",
  "/category",
  "/admin-media-news",
  "/all-users",
  "/promotions",
  "/delivery-pricing",
  "/free-delivery-settings",
  "/contact",
  "/career-admin",
  "/blog-admin",
  "/support",
  "/profile",
];

// The part of the dashboard employees can use (store operations). Must be a
// subset of ADMIN_ONLY_ROUTES; the first entry is where an employee lands.
const EMPLOYEE_ROUTES = [
  "/dashboard",
  "/products",
  "/inventory",
  "/order-list",
  "/category",
  "/profile",
];

const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  /**
   * IMPORTANT:
   * ==========
   * We ONLY treat the user as logged in when our own backend accessToken exists.
   * NextAuth's session cookie (Google OAuth) is used only as a temporary bridge
   * for social login and should NOT be considered an authenticated app session.
   *
   * This prevents the situation where having only the NextAuth cookie blocks
   * access to /login (middleware thought the user was logged in, but they had
   * no app JWT yet).
   */
  let isLoggedIn = !!accessToken;
  // let isLoggedIn = false;
  let userRole: string | null = null;
  let isTokenExpired = false;

  if (accessToken) {
    try {
      const user = jwtDecode<DecodedToken>(accessToken);
      // console.log("Decoded User:", user);

      if (user.exp * 1000 > Date.now()) {
        isLoggedIn = true;
        userRole = user.role;
      } else {
        isTokenExpired = true;
        userRole = user.role;
      }
    } catch {
      isLoggedIn = false;
      userRole = null;
    }
  }

  const isProductDetailsPage = pathname.startsWith("/product-details/");
  const isMediaNewsDetailsPage = pathname.startsWith("/media-news-details/");
  const isCareerDetailsPage = pathname.startsWith("/career-details/");

  const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isEmployeeRoute = EMPLOYEE_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isCustomerRoute = CUSTOMER_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isGuestCustomerOnlyRoute = GUEST_CUSTOMER_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    isProductDetailsPage ||
    isMediaNewsDetailsPage ||
    isCareerDetailsPage;

  // A route the app actually defines (public, customer, admin, guest-only, or auth).
  // Anything outside this set doesn't exist, so it should fall through to Next's
  // own not-found handling instead of being redirected to /login or /.
  const isKnownRoute =
    isPublicRoute ||
    isAdminRoute ||
    isCustomerRoute ||
    isGuestCustomerOnlyRoute ||
    isAuthRoute;

  // Redirect logged-in users away from auth routes
  if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
    const redirectPath =
      userRole === "CUSTOMER"
        ? CUSTOMER_ROUTES[0]
        : userRole === "ADMIN"
          ? ADMIN_ONLY_ROUTES[0]
          : userRole === "EMPLOYEE"
            ? EMPLOYEE_ROUTES[0]
            : "/";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // ====== IF LOGGED IN USER IS ADMIN, CANNOT ACCESS CART OR CHECK OUT PAGE
  if (isLoggedIn && GUEST_CUSTOMER_ONLY_ROUTES.includes(pathname)) {
    if (userRole === "CUSTOMER") {
      return NextResponse.next(); // Allow customer to proceed
    }
    const redirectPath =
      userRole === "EMPLOYEE"
        ? EMPLOYEE_ROUTES[0]
        : userRole === "ADMIN"
          ? ADMIN_ONLY_ROUTES[0]
          : "/";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }
  if (!isLoggedIn && GUEST_CUSTOMER_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Redirect non-logged-in users away from protected routes
  // (only when the route actually exists — unknown paths fall through to not-found)
  if (!isLoggedIn && !isPublicRoute && isKnownRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Allow refresh logic
  if (isTokenExpired && refreshToken) {
    console.log(
      "Access token expired but refresh token exists — allowing request",
    );
    return NextResponse.next();
  }

  // ✅ Role-based access enforcement
  // (only redirect away from known routes the user can't access — unknown
  // paths fall through to not-found instead of bouncing to "/")
  if (isLoggedIn && userRole) {
    if (userRole === "ADMIN") {
      if (!isAdminRoute && !isPublicRoute && isKnownRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else if (userRole === "EMPLOYEE") {
      if (!isEmployeeRoute && !isPublicRoute && isKnownRoute) {
        return NextResponse.redirect(new URL(EMPLOYEE_ROUTES[0], req.url));
      }
    } else if (userRole === "CUSTOMER") {
      if (
        !isCustomerRoute &&
        !isPublicRoute &&
        !isGuestCustomerOnlyRoute &&
        isKnownRoute
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else {
      // Block unknown roles completely
      if (!isPublicRoute && isKnownRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // ✅ Hard block cross-access (defensive double-check)
    if (
      isAdminRoute &&
      userRole !== "ADMIN" &&
      !(userRole === "EMPLOYEE" && isEmployeeRoute)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (isCustomerRoute && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

// ! ========== version 1 ===========

// import { NextRequest, NextResponse } from "next/server";
// import { jwtDecode } from "jwt-decode";

// interface DecodedToken {
//   exp: number;
//   email: string;
//   roles: string;
// }

// const PUBLIC_ROUTES = [
//   "/",
//   "/login",
//   "/about-us",
//   "/product",
//   "/media-news",
//   "/career",
//   "/contact-us",
//   "/create-account",
//   "/product-details/[slug]",
//   "/product-details",
// ];

// const CUSTOMER_ROUTES = [
//   "/my-cart",
//   "/check-out",
//   "/my-account/account-information",
//   "/my-account/order",
//   "/my-account/wishlist"
// ];

// const ADMIN_ONLY_ROUTES = [
//   "/dashboard",
//   "/products",
//   "/order-list",
//   "/category",
//   "/admin-media-news"
// ];

// const AUTH_ROUTES = ["/login", "/signup"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const accessToken = req.cookies.get("accessToken")?.value;
//   const refreshToken = req.cookies.get("refreshToken")?.value;

//   let isLoggedIn = false;
//   let userRole: string | null = null;
//   let isTokenExpired = false;

//   if (accessToken) {
//     try {
//       const user = jwtDecode<DecodedToken>(accessToken);

//       console.log("user", user);

//       if (user.exp * 1000 > Date.now()) {
//         isLoggedIn = true;
//         userRole = user.roles;
//       } else {
//         // Access token is expired, but we have a refresh token
//         isTokenExpired = true;
//         isLoggedIn = true; // Still consider logged in if refresh token exists
//         userRole = user.roles; // Keep the role for redirect logic
//       }
//     } catch {
//       isLoggedIn = false;
//       userRole = null;
//     }
//   }

//   // Check if current path is a product details page
//   const isProductDetailsPage = pathname.startsWith("/product-details/");

//   // If logged in and visiting auth routes → redirect based on role
//   if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
//     const redirectPath = userRole === "CUSTOMER"
//       ? CUSTOMER_ROUTES[0] // Redirect to customer route
//       : userRole === "ADMIN"
//         ? ADMIN_ONLY_ROUTES[0] // Redirect to admin dashboard
//         : "/"; // Fallback to home
//     return NextResponse.redirect(new URL(redirectPath, req.url));
//   }

//   // If NOT logged in and visiting protected routes → redirect to login
//   // Allow product details pages and public routes without authentication
//   if (!isLoggedIn && !PUBLIC_ROUTES.includes(pathname) && !isProductDetailsPage) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // If access token is expired but refresh token exists, allow the request
//   // This gives the axios interceptor a chance to refresh the token
//   if (isTokenExpired && refreshToken) {
//     console.log(
//       "Access token expired but refresh token exists - allowing request to proceed"
//     );
//     return NextResponse.next();
//   }

//   // Role-based access control
//   if (isLoggedIn && userRole) {
//     // ADMIN can only access ADMIN_ONLY_ROUTES and PUBLIC_ROUTES
//     if (userRole === "ADMIN") {
//       const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
//       const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isProductDetailsPage;

//       if (!isAdminRoute && !isPublicRoute) {
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//     }

//     // CUSTOMER can only access CUSTOMER_ROUTES and PUBLIC_ROUTES
//     if (userRole === "CUSTOMER") {
//       const isCustomerRoute = CUSTOMER_ROUTES.some(route => pathname.startsWith(route));
//       const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isProductDetailsPage;

//       if (!isCustomerRoute && !isPublicRoute) {
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//     }

//     // Block other roles from accessing ADMIN_ONLY_ROUTES
//     if (
//       ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route)) &&
//       userRole !== "ADMIN"
//     ) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     // Block other roles from accessing CUSTOMER_ROUTES
//     if (
//       CUSTOMER_ROUTES.some((route) => pathname.startsWith(route)) &&
//       userRole !== "CUSTOMER"
//     ) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
// };
// import { NextRequest, NextResponse } from "next/server";
// import { jwtDecode } from "jwt-decode";

// interface DecodedToken {
//   exp: number;
//   email: string;
//   roles: string;
// }

// const PUBLIC_ROUTES = [
//   "/",
//   "/login",
//   "/about-us",
//   "/product",
//   "/media-news",
//   "/career",
//   "/contact-us",
//   "/create-account",
//   "/product-details/[slug]",
//   "/product-details", // Add this as well to be safe
// ];
// const AUTH_ROUTES = ["/login", "/signup"];
// const DASHBOARD_ROUTE = "/dashboard";
// const ADMIN_ONLY_ROUTES = ["/users-list", "/dashboard"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const accessToken = req.cookies.get("accessToken")?.value;
//   const refreshToken = req.cookies.get("refreshToken")?.value;

//   let isLoggedIn = false;
//   let userRole: string | null = null;
//   let isTokenExpired = false;

//   if (accessToken) {
//     try {
//       const user = jwtDecode<DecodedToken>(accessToken);
//       if (user.exp * 1000 > Date.now()) {
//         isLoggedIn = true;
//         userRole = user.roles;
//       } else {
//         // Access token is expired, but we have a refresh token
//         isTokenExpired = true;
//         isLoggedIn = true; // Still consider logged in if refresh token exists
//         userRole = user.roles; // Keep the role for redirect logic
//       }
//     } catch {
//       isLoggedIn = false;
//       userRole = null;
//     }
//   }

//   // Check if current path is a product details page
//   const isProductDetailsPage = pathname.startsWith("/product-details/");

//   // If logged in and visiting auth routes → redirect based on role
//   if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
//     const redirectPath =
//       userRole === "PROCUREMENT" ? "/it/purchase-management" : DASHBOARD_ROUTE;
//     return NextResponse.redirect(new URL(redirectPath, req.url));
//   }

//   // If NOT logged in and visiting protected routes → redirect to login
//   // Allow product details pages without authentication
//   if (!isLoggedIn && !PUBLIC_ROUTES.includes(pathname) && !isProductDetailsPage) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // If access token is expired but refresh token exists, allow the request
//   // This gives the axios interceptor a chance to refresh the token
//   if (isTokenExpired && refreshToken) {
//     console.log(
//       "Access token expired but refresh token exists - allowing request to proceed"
//     );
//     return NextResponse.next();
//   }

//   // Role-based access control
//   if (isLoggedIn && userRole) {
//     // ADMIN restrictions - only ADMIN can access admin-only routes
//     if (
//       ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route)) &&
//       userRole !== "ADMIN"
//     ) {
//       return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
//     }

//     // ADMIN restrictions for other routes
//     if (
//       userRole === "ADMIN" &&
//       pathname.startsWith("/it/purchase-management")
//     ) {
//       return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
//     }

//     // PROCUREMENT restrictions
//     if (
//       userRole === "PROCUREMENT" &&
//       !pathname.startsWith("/it/purchase-management") &&
//       !PUBLIC_ROUTES.includes(pathname) &&
//       !isProductDetailsPage // Allow product details pages
//     ) {
//       return NextResponse.redirect(new URL("/it/purchase-management", req.url));
//     }

//     // EMPLOYEE restrictions
//     if (userRole === "EMPLOYEE") {
//       const allowedRoutes = ["/it/dashboard", "/profile", "/it/submit-request"];
//       if (
//         !allowedRoutes.some((route) => pathname.startsWith(route)) &&
//         !PUBLIC_ROUTES.includes(pathname) &&
//         !isProductDetailsPage // Allow product details pages
//       ) {
//         return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
//       }
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
// };
