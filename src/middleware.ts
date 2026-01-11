import { NextRequest, NextResponse } from "next/server";

// Define constants directly in middleware since path aliases don't work here
const AUTH_COOKIE_NAMES = {
  token: "auth_token",
  refreshToken: "refresh_token",
  userDetails: "user_details",
} as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get(AUTH_COOKIE_NAMES.token)?.value;
  // const token = "dummy-token"; // Temporary: bypass authentication for testing

  // Define protected routes (routes that require authentication)
  const protectedRoutes = [
    "/dashboard",
    "/logistics",
    "/orders",
    "/payments",
    "/products",
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

  // If accessing auth pages (sign-in page) with a valid token, redirect to dashboard
  // This prevents authenticated users from seeing the sign-in page
  if (isNonProtectedRoute && token) {
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    const homeUrl = new URL(redirectUrl || "/dashboard", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Allow public routes (including landing page) to be accessed by anyone

  return NextResponse.next();
}
