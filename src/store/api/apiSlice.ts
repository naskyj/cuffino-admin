import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { logout } from "@/store/slices/authSlice";
import {
  clearAllAuthCookies,
  getClientCookie,
  getServerCookie,
} from "@/utilities/clientCookies";
import {
  AUTH_COOKIE_NAMES,
  ENV_VARS,
  HTTP_STATUS,
} from "@/utilities/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: ENV_VARS.API_URL,
  prepareHeaders: async (headers) => {
    let token = getClientCookie(AUTH_COOKIE_NAMES.token);

    if (!token) {
      token = (await getServerCookie(AUTH_COOKIE_NAMES.token)) as string;
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
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
  if (result.error && result.error.status === HTTP_STATUS.UNAUTHORIZED) {
    // Only handle logout on client side
    if (typeof window !== "undefined") {
      // Clear all auth cookies
      clearAllAuthCookies();
      // Dispatch logout action to clear Redux state
      api.dispatch(logout());
      // Redirect to sign-in page
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
    "Transactions",
    "BankAccounts",
    "Notification",
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});

// Base slice with no endpoints - endpoints are added via injectEndpoints
