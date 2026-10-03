"use client";

import React from "react";

import { Modal } from "@/components/ui";
import {
  useGetMeasurementProfilesQuery,
  useGetOrdersByCustomerQuery,
  useGetUserAddressesQuery,
  useGetUserByIdQuery,
  useGetUserImagesQuery,
} from "@/store/api";

// Every measurement the profile can carry, in display order. The modal used to hard-code six of
// these, so neck/sleeve/inseam/thigh/calf were silently missing for anyone reviewing a customer.
const MEASUREMENT_FIELDS: [string, string][] = [
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hips", "Hips"],
  ["shoulderWidth", "Shoulder"],
  ["neck", "Neck"],
  ["sleeveLength", "Sleeve Length"],
  ["armLength", "Arm Length"],
  ["legLength", "Leg Length"],
  ["inseam", "Inseam"],
  ["thigh", "Thigh"],
  ["calf", "Calf"],
];

interface UserDetailModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
}

export default function UserDetailModal({
  isOpen,
  userId,
  onClose,
}: UserDetailModalProps) {
  const { data: user, isLoading: userLoading } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });
  const { data: addresses = [], isLoading: addressesLoading } =
    useGetUserAddressesQuery(userId!, { skip: !userId });
  const { data: measurements = [], isLoading: measurementsLoading } =
    useGetMeasurementProfilesQuery(userId!, { skip: !userId });
  const { data: orders = [], isLoading: ordersLoading } =
    useGetOrdersByCustomerQuery(userId!, { skip: !userId });
  // Front/side/back photos the customer attached to their measurements, for eyeballing the
  // numbers below against the actual body.
  const { data: referencePhotos = [] } = useGetUserImagesQuery(
    { userId: userId!, imageType: "MEASUREMENT_REFERENCE" },
    { skip: !userId }
  );

  const isLoading =
    userLoading || addressesLoading || measurementsLoading || ordersLoading;

  const getRoleColor = (role: string | { roleName: string } | undefined) => {
    const roleName = typeof role === "string" ? role : role?.roleName || "";
    switch (roleName.toUpperCase()) {
      case "ADMIN":
        return "bg-primary/20 text-primary border-primary/30";
      case "MANAGER":
        return "bg-primary/15 text-primary border-primary/30";
      case "CUSTOMER":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-primary/20 text-primary border-primary/30";
      case "PAID":
      case "PROCESSING":
        return "bg-primary/15 text-primary border-primary/30";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-6xl w-[95vw] mx-2"
    >
      <div className="bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-primary/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">User Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete user information and activity
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <div className="text-gray-500 font-medium">
              Loading user details...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Username
                  </div>
                  <p className="text-base font-semibold text-gray-900 mt-1 break-words [overflow-wrap:anywhere]">
                    {user?.username || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </div>
                  <p className="text-base font-semibold text-gray-900 mt-1 break-words [overflow-wrap:anywhere]">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Role
                  </div>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${getRoleColor(
                        user?.role
                      )}`}
                    >
                      {typeof user?.role === "string"
                        ? user.role.toUpperCase()
                        : user?.role?.roleName?.toUpperCase() || "N/A"}
                    </span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </div>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                        user?.active
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {user?.active ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </p>
                </div>
                {user?.phoneNumber && (
                  <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phone
                    </div>
                    <p className="text-base font-semibold text-gray-900 mt-1 break-words [overflow-wrap:anywhere]">
                      {user.phoneNumber}
                    </p>
                  </div>
                )}
                {user?.companyName && (
                  <div className="bg-white rounded-lg p-4 border border-primary/20 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Company
                    </div>
                    <p className="text-base font-semibold text-gray-900 mt-1 break-words [overflow-wrap:anywhere]">
                      {user.companyName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Shipping Addresses
                </h3>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  {addresses.length}
                </span>
              </div>
              {addresses.length === 0 ? (
                <div className="bg-white rounded-lg p-6 border border-primary/20 text-center">
                  <p className="text-sm text-gray-500">No addresses found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address: any) => (
                    <div
                      key={address.addressId}
                      className="bg-white rounded-lg p-5 border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 break-words">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-gray-900 text-lg">
                              {address.label || "Address"}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p className="font-medium">
                              {address.streetAddress}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                            </p>
                            <p>
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurement Profiles */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Measurement Profiles
                </h3>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  {measurements.length}
                </span>
              </div>
              {measurements.length === 0 ? (
                <div className="bg-white rounded-lg p-6 border border-primary/20 text-center">
                  <p className="text-sm text-gray-500">
                    No measurement profiles found
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurements.map((measurement: any) => (
                    <div
                      key={measurement.profileId}
                      className="bg-white rounded-lg p-5 border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <h4 className="font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-primary/20 break-words">
                        {measurement.profileName}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                        {MEASUREMENT_FIELDS.filter(
                          ([key]) => measurement[key] !== null && measurement[key] !== undefined && measurement[key] !== ""
                        ).map(([key, label]) => (
                          <div
                            key={key}
                            className="bg-primary/5 rounded-lg p-3 border border-primary/20 min-w-0"
                          >
                            <span className="text-primary font-semibold">{label}:</span>{" "}
                            <span className="text-gray-900 font-bold whitespace-nowrap">
                              {measurement[key]} cm
                            </span>
                          </div>
                        ))}
                      </div>
                      {measurement.additionalNotes && (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <p className="text-sm text-gray-600 italic whitespace-pre-line break-words">
                            {measurement.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurement reference photos */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  Measurement Reference Photos
                </h3>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  {referencePhotos.length}
                </span>
              </div>
              {referencePhotos.length === 0 ? (
                <div className="bg-white rounded-lg p-6 border border-primary/20 text-center">
                  <p className="text-sm text-gray-500">
                    No front/side/back photos uploaded
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {referencePhotos.map((photo) => (
                    <a
                      key={photo.imageId}
                      href={photo.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block bg-white rounded-lg border-2 border-primary/20 overflow-hidden hover:border-primary/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.description || "Measurement reference"}
                        className="h-64 w-full object-contain bg-gray-50"
                      />
                      <p className="px-3 py-2 text-sm font-semibold text-gray-700">
                        {photo.description || "Photo"}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Orders */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Orders</h3>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  {orders.length}
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg p-6 border border-primary/20 text-center">
                  <p className="text-sm text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border-2 border-primary/20 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order: any) => (
                        <tr
                          key={order.orderId}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-primary">
                              #{order.orderId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              ${(order.grandTotal ?? order.totalPrice ?? 0).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
