"use client";

import React, { useEffect, useState } from "react";

import { Button, Input, PasswordInput } from "@/components/ui";
import {
  useChangePasswordMutation,
  useGetUserByIdQuery,
  useSendPasswordOtpMutation,
  useUpdateUserMutation,
} from "@/store/api";
import { getUserDetailsFromCookie, getUserRoleFromCookie } from "@/utilities";
import { showToast } from "@/utilities/toast";

import PageHeader from "../_components/PageHeader";

// The avatar in the dashboard header pushed to /account, which was never a route - this is the
// page it should have opened. Works identically for ADMIN and MANAGER: the backend's
// /user/get/{id} and /user/update/{id} both allow "ADMIN or MANAGER or the user themselves", so a
// manager editing their own profile is authorized on both counts.

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SUPPORT: "Support Agent",
  VENDOR: "Vendor",
  DESIGNER: "Designer/Tailor",
  CUSTOMER: "Customer",
};

const ProfilePage = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>("");
  const [cookieEmail, setCookieEmail] = useState<string>("");

  useEffect(() => {
    const details = getUserDetailsFromCookie();
    const id = Number(details?.creator?.userId);
    setUserId(Number.isFinite(id) && id > 0 ? id : null);
    setRole((getUserRoleFromCookie() || "").toUpperCase());
    setCookieEmail(details?.creator?.email || "");
  }, []);

  const { data: user, isLoading } = useGetUserByIdQuery(userId as number, {
    skip: userId === null,
  });
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const [sendPasswordOtp, { isLoading: isSendingOtp }] = useSendPasswordOtpMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // ----- profile details form -----
  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    companyName: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      companyName: user.companyName || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userId === null) return;
    try {
      await updateUser({
        id: userId,
        data: {
          username: form.username,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address,
          companyName: form.companyName,
          bio: form.bio,
        },
      }).unwrap();
      showToast.success("Profile updated");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Couldn't save your profile";
      showToast.error(message);
    }
  };

  // ----- password change -----
  // The backend's /user/change-password deliberately requires BOTH the emailed code and the
  // current password, so this is a two-step form rather than a single submit.
  const [otpSent, setOtpSent] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    otp: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const effectiveEmail = user?.email || cookieEmail;

  const handleSendOtp = async () => {
    if (!effectiveEmail) {
      showToast.error("No email on this account to send a code to");
      return;
    }
    try {
      await sendPasswordOtp({ email: effectiveEmail }).unwrap();
      setOtpSent(true);
      showToast.success(`Verification code sent to ${effectiveEmail}`);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Couldn't send the verification code";
      showToast.error(message);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error("New passwords don't match");
      return;
    }
    if (!effectiveEmail) {
      showToast.error("No email on this account");
      return;
    }
    try {
      await changePassword({
        email: effectiveEmail,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        // The backend's ChangePasswordDTO carries the OTP alongside the old password.
        otp: passwordForm.otp,
      }).unwrap();
      showToast.success("Password changed");
      setOtpSent(false);
      setPasswordForm({ otp: "", oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Couldn't change your password";
      showToast.error(message);
    }
  };

  if (userId === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" />
        <p className="text-sm text-gray-600">
          We couldn&apos;t work out which account you&apos;re signed in as. Please sign out and
          back in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="My Profile"
        subtitle={
          role
            ? `Signed in as ${ROLE_LABEL[role] || role}`
            : "Your account details"
        }
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading your profile...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
            <p className="mt-1 text-sm text-gray-500">
              These are shown to colleagues on orders and tickets you handle.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
              <div>
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium text-gray-900">
                  {ROLE_LABEL[role] || role || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">
                  {user?.active ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>

            <form className="mt-5 space-y-4" onSubmit={handleSaveProfile}>
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@cuffino.com"
              />
              <Input
                label="Phone number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
              <Input
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
              />
              <Input
                label="Company"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Company name"
              />
              <div>
                <label className="text-sm mb-2 font-medium text-foreground" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="A short description colleagues will see"
                />
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
            <p className="mt-1 text-sm text-gray-500">
              For security this needs both a code emailed to{" "}
              <span className="font-medium">{effectiveEmail || "your address"}</span> and your
              current password.
            </p>

            {!otpSent ? (
              <div className="mt-5 space-y-3">
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !effectiveEmail}
                  className="w-full"
                >
                  {isSendingOtp ? "Sending..." : "Email me a verification code"}
                </Button>
                <p className="text-xs text-gray-500">
                  The code expires after 15 minutes.
                </p>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleChangePassword}>
                <Input
                  label="Verification code"
                  value={passwordForm.otp}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, otp: e.target.value })
                  }
                  placeholder="6-digit code from your email"
                  inputMode="numeric"
                  maxLength={6}
                />
                <PasswordInput
                  label="Current password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  placeholder="Current password"
                />
                <PasswordInput
                  label="New password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="At least 8 characters, with a letter and a number"
                />
                <PasswordInput
                  label="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Repeat the new password"
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isChangingPassword} className="flex-1">
                    {isChangingPassword ? "Changing..." : "Change password"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
