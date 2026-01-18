"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";

import { Button, Input } from "@/components/ui";
import { useLoginMutation } from "@/store/api";
import { loginSuccess } from "@/store/slices/authSlice";
import { setTokenToCookie, setUserDetailsToCookie } from "@/utilities";

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

const SignInPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<LoginformData>({
    resolver: yupResolver(loginSchema),
  });

  const { handleSubmit, control } = form;

  const handleFormSubmit = async (formData: LoginformData) => {
    try {
      setErrorMessage("");
      const response = await login({
        username: formData.username,
        password: formData.password,
      }).unwrap();

      if (response.token && response.user) {
        // Store token in cookie
        setTokenToCookie(response.token);

        // Store user details in cookie (mapping backend user to expected format)
        const userDetails = {
          creator: {
            email: response.user.email,
            username: response.user.username,
            userId: response.user.userId.toString(),
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
          })
        );

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      const error = err as { data?: { message?: string }; message?: string };
      const errorMsg =
        error?.data?.message ||
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
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  label="Password"
                  placeholder="Enter Password"
                  type="password"
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
