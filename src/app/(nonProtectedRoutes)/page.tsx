"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";

import { Button, Input, PasswordInput } from "@/components/ui";
import { useLoginMutation } from "@/store/api";
import { loginSuccess } from "@/store/slices/authSlice";
import {
  setRefreshTokenToCookie,
  setTokenToCookie,
  setUserDetailsToCookie,
} from "@/utilities";

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username or email is required")
    .min(3, "Username/email must be at least 3 characters")
    .max(100, "Username/email must not exceed 100 characters")
    .trim(),
  password: yup.string().required("Password is required"),
});

type LoginformData = yup.InferType<typeof loginSchema>;

/** Roles permitted to use the admin console at all. */
const ADMIN_CONSOLE_ROLES = ["ADMIN", "MANAGER"];

/**
 * Where a given role starts after signing in. Both currently land on /dashboard, which itself
 * switches between AdminDashboard and ManagerDashboard on role - kept as a function so giving a
 * role a genuinely separate route later is a one-line change here rather than a hunt through
 * call sites.
 */
const landingRouteForRole = (roleName: string): string => {
  switch (roleName) {
    case "MANAGER":
      return "/dashboard";
    case "ADMIN":
    default:
      return "/dashboard";
  }
};

const SignInPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<LoginformData>({
    resolver: yupResolver(loginSchema),
  });

  const { handleSubmit, control } = form;

  // The middleware bounces a signed-in non-staff account back here with ?error=forbidden. Read
  // from window.location rather than useSearchParams: the latter forces this page into a Suspense
  // boundary at build time, and there is nothing to suspend on for a single query flag.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "forbidden") {
      setErrorMessage(
        "That account doesn't have access to the admin console. Please sign in with an admin or manager account."
      );
    }
  }, []);

  const handleFormSubmit = async (formData: LoginformData) => {
    try {
      setErrorMessage("");
      const response = await login({
        username: formData.username,
        password: formData.password,
      }).unwrap();

      // Only ADMIN and MANAGER belong in the admin console. Before this check, ANY valid
      // account - including a plain CUSTOMER - could sign in here and land on /dashboard; the
      // page would render and then every API call behind it would 403 one by one, which reads as
      // a broken app rather than "you're in the wrong place". Note the backend is still the real
      // boundary (@PreAuthorize on every endpoint); this is about not letting the wrong person
      // through the front door in the first place.
      const roleName = (response.user?.role?.roleName || "").toUpperCase();
      if (!ADMIN_CONSOLE_ROLES.includes(roleName)) {
        setErrorMessage(
          "This account doesn't have access to the admin console. Please sign in with an admin or manager account."
        );
        return;
      }

      if (response.token && response.user) {
        // Store token in cookie
        setTokenToCookie(response.token);
        if (response.refreshToken) {
          setRefreshTokenToCookie(response.refreshToken);
        }

        // Store user details in cookie (mapping backend user to expected format)
        const userDetails = {
          creator: {
            email: response.user.email,
            username: response.user.username,
            userId: response.user.userId.toString(),
            roleName: response.user.role?.roleName,
            first_name: response.user.username,
            last_name: "",
            address: response.user.userDetail?.address || "",
            phone: response.user.userDetail?.phoneNumber || "",
            profile_picture: "",
            dob: "",
            kyc_verified: response.user.active,
            subscribed: false,
          },
          wallet: {
            id: "",
            balance: 0,
            total_earned: 0,
            banks: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          total_earned: 0,
          total_uploads: 0,
        };
        setUserDetailsToCookie(userDetails);

        // Update Redux store
        dispatch(
          loginSuccess({
            user: userDetails,
            token: response.token,
            refreshToken: response.refreshToken,
          })
        );

        // Each role lands on its own view: /dashboard renders AdminDashboard or ManagerDashboard
        // depending on the signed-in role, so an admin gets the revenue view and a manager gets
        // the operations one rather than a view built for somebody else's job.
        router.push(landingRouteForRole(roleName));
      }
    } catch (err) {
      const error = err as {
        data?: { message?: string; error?: string };
        message?: string;
        error?: string;
      };
      const errorMsg =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        error?.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="space-y-5 pb-4 w-full">
      <div className="w-full">
        <h3 className="font-semibold text-xl md:text-2xl">Sign In</h3>
        <p className="text-sm md:text-base text-[#637381] ">
          Enter your username and password to access the admin panel.
        </p>
      </div>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5">
            <Controller
              name="username"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  label="Username or Email"
                  type="text"
                  placeholder="Enter username or email"
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <PasswordInput
                  value={field.value}
                  onChange={field.onChange}
                  ref={field.ref}
                  label="Password"
                  placeholder="Enter Password"
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="space-y-3 ">
              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SignInPage;
