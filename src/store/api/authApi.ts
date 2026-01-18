import { baseSlice } from "./apiSlice";

// Auth Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  statusCode: number;
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "ADMIN" | "MANAGER";
  address?: string;
  phoneNumber?: string;
  companyName?: string;
  bio?: string;
}

export interface RegisterResponse {
  message: string;
  status: number;
  data: {
    userId: number;
    username: string;
    email: string;
    isActive: boolean;
    role: string;
  };
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface VerifyResponse {
  message: string;
  status: number;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  statusCode: number;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  status: number;
}

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: {
    roleId: number;
    roleName: string;
    permissions?: any[];
  };
  userDetail?: {
    detailId: number;
    address?: string;
    phoneNumber?: string;
    companyName?: string;
    bio?: string;
  };
  active: boolean;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow additional properties
}

export interface AuthAPIResponse<T = any> {
  message: string;
  status: number;
  data?: T;
}

// Extend the baseSlice with auth-specific endpoints
export const authApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: "/user/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
    }),

    // User Registration
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: "/user/add",
        method: "POST",
        body: data,
      }),
    }),

    // Verify Email
    verifyEmail: builder.mutation<VerifyResponse, VerifyRequest>({
      query: (data) => ({
        url: "/user/verify",
        method: "POST",
        body: data,
      }),
    }),

    // Resend Verification Code
    resendVerification: builder.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: (data) => ({
        url: "/user/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    // Change Password
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/user/change-password",
        method: "POST",
        body: data,
      }),
    }),

    // Get OTP (Development/Testing only)
    getOTP: builder.mutation<
      {
        email: string;
        otp: string;
        expirationTime: string;
        message: string;
      },
      { email: string }
    >({
      query: (data) => ({
        url: "/user/get-otp",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useChangePasswordMutation,
  useGetOTPMutation,
} = authApi;
