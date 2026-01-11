import Cookies from "js-cookie";

import { AuthResponse } from "@/types";

import { AUTH_COOKIE_NAMES, PURCHASE_COOKIE_NAMES } from "./constants";

// Client-side cookie utilities
export const getClientCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(name);
};

export const setClientCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes
): void => {
  if (typeof window === "undefined") return;
  Cookies.set(name, value, {
    expires: 1 / 24, // 1 hour
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    ...options,
  });
};

export const removeClientCookie = (name: string): void => {
  if (typeof window === "undefined") return;
  Cookies.remove(name);
};

// Server-side cookie utilities (for SSR)
export const getServerCookie = async (
  _name: string
): Promise<string | undefined> =>
  // This would typically be used in getServerSideProps or API routes
  // For now, we'll return undefined as this is a client-side implementation
  undefined;

// User details from cookie
export const getUserDetailsFromCookie = (): AuthResponse | null => {
  const userDetails = getClientCookie(AUTH_COOKIE_NAMES.userDetails);
  if (!userDetails) return null;

  try {
    return JSON.parse(userDetails) as AuthResponse;
  } catch (error) {
    console.error("Error parsing user details from cookie:", error);
    return null;
  }
};

export const setUserDetailsToCookie = (user: AuthResponse): void => {
  setClientCookie(AUTH_COOKIE_NAMES.userDetails, JSON.stringify(user));
};

export const removeUserDetailsFromCookie = (): void => {
  removeClientCookie(AUTH_COOKIE_NAMES.userDetails);
};

// Token utilities
export const getTokenFromCookie = (): string | null =>
  getClientCookie(AUTH_COOKIE_NAMES.token) || null;

export const setTokenToCookie = (token: string): void => {
  setClientCookie(AUTH_COOKIE_NAMES.token, token, {
    expires: 1 / 24, // 1 hour
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
  });
};

export const removeTokenFromCookie = (): void => {
  removeClientCookie(AUTH_COOKIE_NAMES.token);
};

// Refresh token utilities
export const getRefreshTokenFromCookie = (): string | null =>
  getClientCookie(AUTH_COOKIE_NAMES.refreshToken) || null;

export const setRefreshTokenToCookie = (refreshToken: string): void => {
  setClientCookie(AUTH_COOKIE_NAMES.refreshToken, refreshToken, {
    expires: 30, // 1 month
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const removeRefreshTokenFromCookie = (): void => {
  removeClientCookie(AUTH_COOKIE_NAMES.refreshToken);
};

// Clear all auth cookies
export const clearAllAuthCookies = (): void => {
  removeTokenFromCookie();
  removeRefreshTokenFromCookie();
  removeUserDetailsFromCookie();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getTokenFromCookie();
  const userDetails = getUserDetailsFromCookie();
  return !!(token && userDetails);
};

// Get user ID from cookie
export const getUserIdFromCookie = (): string | null => {
  const userDetails = getUserDetailsFromCookie();
  return userDetails?.creator.email || null;
};

// Get user role from cookie

// Purchaser email utilities
export const getPurchaserEmailFromCookie = (): string | null =>
  getClientCookie(PURCHASE_COOKIE_NAMES.purchaserEmail as string) || null;

export const setPurchaserEmailToCookie = (email: string): void => {
  setClientCookie(PURCHASE_COOKIE_NAMES.purchaserEmail, email, {
    expires: 7, // 7 days - enough time for user to download
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const removePurchaserEmailFromCookie = (): void => {
  removeClientCookie(PURCHASE_COOKIE_NAMES.purchaserEmail);
};

// Purchase product ID utilities
export const getPurchaseProductIdFromCookie = (): string | null =>
  getClientCookie(PURCHASE_COOKIE_NAMES.purchaseProductId as string) || null;

export const setPurchaseProductIdToCookie = (productId: string): void => {
  setClientCookie(PURCHASE_COOKIE_NAMES.purchaseProductId, productId, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const removePurchaseProductIdFromCookie = (): void => {
  removeClientCookie(PURCHASE_COOKIE_NAMES.purchaseProductId);
};

// Clear all purchase cookies
export const clearPurchaseCookies = (): void => {
  removePurchaserEmailFromCookie();
  removePurchaseProductIdFromCookie();
};
