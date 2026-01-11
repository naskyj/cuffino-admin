import { User } from "@/types";
import { AuthResponse, VerifyMagicLinkResponse } from "@/types/api";

import { baseSlice } from "./apiSlice";

// Auth response types

export interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

export interface SocialLoginRequest {
  provider: "google" | "twitter" | "x";
  token: string;
  redirectUrl?: string;
}

export interface OnboardingRequest {
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  profile_picture?: string;
  country_code: string;
  dob: string; // 2025-12-17T09:10:53.572Z"
}

export interface KycVerificationRequest {
  id_num: string;
  type?: "old_voters_card" | "new_voters_card"; // Only required for Ghana voters card
}

export interface PushSubscriptionRequest {
  auth: string;
  exp_time: string; // ISO date string
}

// API Error Response Interface
export interface ApiErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
  ctx?: {
    expected?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  detail: ApiErrorDetail[];
}

// Extend the baseSlice with auth-specific endpoints
export const authApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send magic link to email
    sendMagicLink: builder.mutation<
      {
        access_token: string;
        token_type: string;
      },
      MagicLinkRequest
    >({
      query: (data) => ({
        url: "/auth/magiclink",
        method: "POST",
        body: data,
      }),
    }),

    // Verify magic link and get user details
    verifyMagicLink: builder.mutation<
      VerifyMagicLinkResponse,
      { token: string }
    >({
      query: ({ token }) => ({
        url: "/auth/token",
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    // Social login with X (Twitter)
    loginWithX: builder.mutation<
      AuthResponse,
      { token: string; redirectUrl?: string }
    >({
      query: (data) => ({
        url: "/auth/x",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
    }),

    // Get user details by token
    getUserDetails: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth", "User", "Profile"],
    }),

    // Refresh token
    refreshToken: builder.mutation<
      { token: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Logout user
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
    }),

    // Check if user is authenticated
    checkAuth: builder.query<{ isAuthenticated: boolean; user?: User }, void>({
      query: () => "/auth/check",
      providesTags: ["Auth"],
    }),

    completeProfile: builder.mutation<void, OnboardingRequest>({
      query: (data) => ({
        url: "/auth/onboarding",
        method: "POST",
        body: data,
      }),
    }),

    kycVerification: builder.mutation<void, KycVerificationRequest>({
      query: (data) => ({
        url: "/auth/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
    }),

    // Save push notification subscription
    saveSubscription: builder.mutation<void, PushSubscriptionRequest>({
      query: (data) => ({
        url: "/auth/subscription",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
    }),
  }),
});
// Export hooks for usage in functional components
export const {
  useSendMagicLinkMutation,
  useVerifyMagicLinkMutation,
  useLoginWithXMutation,
  useGetUserDetailsQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  useCheckAuthQuery,
  useCompleteProfileMutation,
  useKycVerificationMutation,
  useSaveSubscriptionMutation,
} = authApi;
