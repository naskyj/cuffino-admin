"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import { Button, Input } from "@/components/ui";
import { setTokenToCookie } from "@/utilities";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .lowercase()
    .trim(),
  password: yup.string().required("Password is required"),
});

type LoginformData = yup.InferType<typeof loginSchema>;

const SignInPage = () => {
  const router = useRouter();

  const form = useForm<LoginformData>({
    resolver: yupResolver(loginSchema),
  });

  const { handleSubmit, control } = form;

  const handleFormSubmit = (formData: LoginformData) => {
    console.warn(formData);
    setTokenToCookie("testtt-token");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-5 pb-4 w-full">
      <div className="w-full">
        <h3 className="font-semibold text-xl md:text-2xl">
          Enter Your Email Address
        </h3>
        <p className="text-sm md:text-base text-[#637381] ">
          We&apos;ll send a passwordless login link to your inbox.{" "}
        </p>
      </div>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  label="Email Address"
                  type="email"
                  placeholder="Enter Email Address"
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
              <Button className="w-full">Login</Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SignInPage;
