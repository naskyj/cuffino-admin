import { NextRequest, NextResponse } from "next/server";

// Define constants directly in middleware since path aliases don't work here
const AUTH_COOKIE_NAMES = {
  token: "auth_token",
  refreshToken: "refresh_token",
  userDetails: "user_details",
} as const;

/**
 * Only these roles may use the admin console. The backend's @PreAuthorize annotations are the
 * actual security boundary; this stops the wrong person from getting a half-rendered console
 * where every panel 403s one at a time.
 */
const ADMIN_CONSOLE_ROLES = ["ADMIN", "MANAGER"];

const readRoleFromCookie = (request: NextRequest): string | null => {
  const raw = request.cookies.get(AUTH_COOKIE_NAMES.userDetails)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { creator?: { roleName?: string } };
    return (parsed?.creator?.roleName || "").toUpperCase() || null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get(AUTH_COOKIE_NAMES.token)?.value;

  // Define protected routes (routes that require authentication)
  const protectedRoutes = [
    "/dashboard",
    "/logistics",
    "/inventory",
    "/notifications",
    "/orders",
    "/payments",
    "/production",
    "/products",
    "/profile",
    "/returns",
    "/support",
    "/users",
  ];

  // Define non-protected routes (routes that don't require authentication)
  // Note: publicRoutes includes these, but kept separate for clarity
  const nonProtectedRoutes = ["/login"];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route (landing page, sign-in, etc.)

  // Check if the current path is a non-protected route (auth pages)
  const isNonProtectedRoute =
    nonProtectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/";
  // If accessing a protected route without a token, redirect to sign-in
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Having a token is not the same as belonging here. The sign-in page already refuses
  // non-staff roles, but a cookie can be set by hand, and a role can be revoked while a session
  // is still live - so the check is repeated on every protected navigation rather than trusted
  // once at login.
  if (isProtectedRoute && token) {
    const role = readRoleFromCookie(request);
    if (role && !ADMIN_CONSOLE_ROLES.includes(role)) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(signInUrl);
    }
  }

  // If accessing auth pages (sign-in page) with a valid token, redirect to dashboard
  // This prevents authenticated users from seeing the sign-in page
  if (isNonProtectedRoute && token) {
    const role = readRoleFromCookie(request);
    // ...unless the signed-in account isn't allowed in the console at all, in which case
    // bouncing them to /dashboard would just bounce them straight back here - an infinite loop.
    if (!role || ADMIN_CONSOLE_ROLES.includes(role)) {
      const redirectUrl = request.nextUrl.searchParams.get("redirect");
      const homeUrl = new URL(redirectUrl || "/dashboard", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow public routes (including landing page) to be accessed by anyone

  return NextResponse.next();
}
