import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { loginSuccess, logout } from "@/store/slices/authSlice";
import {
  clearAllAuthCookies,
  getClientCookie,
  getServerCookie,
  getRefreshTokenFromCookie,
  getUserDetailsFromCookie,
  setRefreshTokenToCookie,
  setTokenToCookie,
} from "@/utilities/clientCookies";
import {
  AUTH_COOKIE_NAMES,
  ENV_VARS,
  HTTP_STATUS,
} from "@/utilities/constants";

const resolveApiBaseUrl = (): string => {
  const configuredUrl = ENV_VARS.API_URL;

  // In SSR/non-browser contexts, keep configured value.
  if (typeof window === "undefined") {
    return configuredUrl;
  }

  try {
    const parsedUrl = new URL(configuredUrl);
    const configuredHost = parsedUrl.hostname;
    const currentHost = window.location.hostname;

    const isConfiguredLocalHost =
      configuredHost === "localhost" || configuredHost === "127.0.0.1";
    const isCurrentLocalHost =
      currentHost === "localhost" || currentHost === "127.0.0.1";

    // If app is opened on LAN IP but API points to localhost, map API host to current host.
    if (isConfiguredLocalHost && !isCurrentLocalHost) {
      parsedUrl.hostname = currentHost;
      return parsedUrl.toString().replace(/\/$/, "");
    }
  } catch {
    return configuredUrl;
  }

  return configuredUrl;
};

const baseQuery = fetchBaseQuery({
  baseUrl: resolveApiBaseUrl(),
  prepareHeaders: async (headers, { extra: _extra, endpoint: _endpoint }) => {
    let token = getClientCookie(AUTH_COOKIE_NAMES.token);

    if (!token) {
      token = (await getServerCookie(AUTH_COOKIE_NAMES.token)) as string;
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Only set Content-Type if not already set
    // RTK Query will automatically handle FormData and not set Content-Type for it
    // So we only set it for JSON requests
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Check if the response is a 401 Unauthorized
  const skipUnauthorizedRedirectEndpoints = [
    "login",
    "refreshToken",
    "register",
    "verifyEmail",
    "resendVerification",
  ];

  if (
    result.error &&
    result.error.status === HTTP_STATUS.UNAUTHORIZED &&
    !skipUnauthorizedRedirectEndpoints.includes(api.endpoint)
  ) {
    if (typeof window !== "undefined") {
      const refreshToken = getRefreshTokenFromCookie();

      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: "/user/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        const refreshedData = refreshResult.data as
          | {
              token?: string;
              refreshToken?: string;
            }
          | undefined;

        if (refreshedData?.token && refreshedData.refreshToken) {
          setTokenToCookie(refreshedData.token);
          setRefreshTokenToCookie(refreshedData.refreshToken);

          const userDetails = getUserDetailsFromCookie();
          if (userDetails) {
            api.dispatch(
              loginSuccess({
                user: userDetails,
                token: refreshedData.token,
                refreshToken: refreshedData.refreshToken,
              })
            );
          }

          return await baseQuery(args, api, extraOptions);
        }
      }

      clearAllAuthCookies();
      api.dispatch(logout());
      window.location.href = "/sign-in";
    }
  }

  return result;
};

export const baseSlice = createApi({
  reducerPath: "api",
  tagTypes: [
    "Auth",
    "User",
    "Profile",
    "Upload",
    "Products",
    "ProductCategories",
    "ProductCustomizations",
    "Orders",
    "Cart",
    "Payments",
    "Logistics",
    "Returns",
    "Production",
    "Inventory",
    "Addresses",
    "Measurements",
    "Images",
    "Transactions",
    "BankAccounts",
    "Notification",
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});

// Base slice with no endpoints - endpoints are added via injectEndpoints
