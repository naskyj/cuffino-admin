"use client";

import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  useCreateDesignerUserMutation,
  useCreateManagerMutation,
  useCreateVendorUserMutation,
  useDeleteUserMutation,
  useGetAllDesignersQuery,
  useGetAllUsersQuery,
  useGetAllVendorsQuery,
  useGetNotificationSettingsQuery,
  useLazyGetDesignerOrderItemsQuery,
  useUpdateNotificationSettingsMutation,
  useUpdateUserMutation,
} from "@/store/api";
import { getUserRoleFromCookie } from "@/utilities";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";
import UserDetailModal from "./_components/UserDetailModal";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showDesignerOrdersModal, setShowDesignerOrdersModal] = useState(false);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [staffType, setStaffType] = useState<"manager" | "vendor" | "designer">(
    "manager"
  );
  const [staffForm, setStaffForm] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    displayName: "",
    contactInfo: "",
  });
  const [selectedDesigner, setSelectedDesigner] = useState<{
    designerId: number;
    designerName: string;
  } | null>(null);
  const currentRole = getUserRoleFromCookie()?.toUpperCase();
  const canManageUsers = currentRole === "ADMIN";

  const { data: users = [], isLoading, refetch } = useGetAllUsersQuery();
  const { data: designers = [], isLoading: designersLoading } =
    useGetAllDesignersQuery();
  const { data: vendors = [], isLoading: vendorsLoading } =
    useGetAllVendorsQuery();
  const { data: notificationSettings } = useGetNotificationSettingsQuery(undefined, {
    skip: !canManageUsers,
  });
  const [loadDesignerOrderItems, { data: designerOrderItems = [], isFetching: isLoadingDesignerOrders }] =
    useLazyGetDesignerOrderItemsQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createManager] = useCreateManagerMutation();
  const [createVendorUser] = useCreateVendorUserMutation();
  const [createDesignerUser] = useCreateDesignerUserMutation();
  const [updateNotificationSettings] = useUpdateNotificationSettingsMutation();

  type UserTableRow = {
    userId: number;
    username: string;
    email?: string;
    active?: boolean;
    role: string | { roleName: string };
    designerId?: number;
    vendorId?: number;
    source: "USER" | "DESIGNER" | "VENDOR";
  };

  const userRows: UserTableRow[] = users.map((user) => ({
    ...(user as UserTableRow),
    source: "USER",
  }));

  const mergedMap = new Map<number, UserTableRow>();
  userRows.forEach((row) => mergedMap.set(row.userId, row));

  designers.forEach((designer) => {
    const linkedUserId = designer.user?.userId;
    if (linkedUserId && mergedMap.has(linkedUserId)) {
      const base = mergedMap.get(linkedUserId)!;
      mergedMap.set(linkedUserId, {
        ...base,
        role: "DESIGNER",
        designerId: designer.designerId,
      });
      return;
    }

    const syntheticId = linkedUserId || -(100000 + designer.designerId);
    mergedMap.set(syntheticId, {
      userId: syntheticId,
      username:
        designer.user?.username ||
        designer.designerName ||
        `designer-${designer.designerId}`,
      email: designer.user?.email || designer.contactInfo || "",
      active: true,
      role: "DESIGNER",
      designerId: designer.designerId,
      source: "DESIGNER",
    });
  });

  vendors.forEach((vendor) => {
    const linkedUserId = vendor.user?.userId;
    if (linkedUserId && mergedMap.has(linkedUserId)) {
      const base = mergedMap.get(linkedUserId)!;
      if (typeof base.role === "string" && base.role === "DESIGNER") {
        return;
      }
      mergedMap.set(linkedUserId, {
        ...base,
        role: "VENDOR",
        vendorId: vendor.vendorId,
      });
      return;
    }

    const syntheticId = linkedUserId || -(200000 + vendor.vendorId);
    mergedMap.set(syntheticId, {
      userId: syntheticId,
      username:
        vendor.user?.username || vendor.vendorName || `vendor-${vendor.vendorId}`,
      email: vendor.user?.email || vendor.contactInfo || "",
      active: true,
      role: "VENDOR",
      vendorId: vendor.vendorId,
      source: "VENDOR",
    });
  });

  const mergedUsers = Array.from(mergedMap.values());

  const getStatusColor = (isActive: boolean | undefined) =>
    isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";

  const getRoleColor = (role: any) => {
    const roleName = typeof role === "string" ? role : role?.roleName || "";
    switch (roleName.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "DESIGNER":
        return "bg-amber-100 text-amber-800";
      case "VENDOR":
        return "bg-emerald-100 text-emerald-800";
      case "CUSTOMER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDesignerOrders = async (designerId: number, designerName: string) => {
    setSelectedDesigner({ designerId, designerName });
    setShowDesignerOrdersModal(true);
    try {
      await loadDesignerOrderItems(designerId).unwrap();
    } catch {
      showToast.error("Failed to load designer assigned orders");
    }
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete).unwrap();
        showToast.success("User deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setUserToDelete(null);
      } catch {
        showToast.error("Failed to delete user");
        setShowDeleteDialog(false);
        setUserToDelete(null);
      }
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await updateUser({
        id: user.userId,
        data: { ...user, active: !user.active },
      }).unwrap();
      showToast.success("User status updated successfully");
      refetch();
    } catch {
      showToast.error("Failed to update user status");
    }
  };

  const handleOpenCreateStaff = (type: "manager" | "vendor" | "designer") => {
    setStaffType(type);
    setStaffForm({
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      displayName: "",
      contactInfo: "",
    });
    setShowCreateStaffModal(true);
  };

  const handleCreateStaff = async () => {
    try {
      const payload = {
        username: staffForm.username.trim(),
        email: staffForm.email.trim(),
        password: staffForm.password,
        phoneNumber: staffForm.phoneNumber.trim() || undefined,
        displayName: staffForm.displayName.trim() || undefined,
        contactInfo: staffForm.contactInfo.trim() || undefined,
      };

      if (!payload.username || !payload.email || !payload.password) {
        showToast.error("Username, email and password are required");
        return;
      }

      if (staffType === "manager") {
        await createManager(payload).unwrap();
      } else if (staffType === "vendor") {
        await createVendorUser(payload).unwrap();
      } else {
        await createDesignerUser(payload).unwrap();
      }

      showToast.success(`${staffType} created successfully`);
      setShowCreateStaffModal(false);
      refetch();
    } catch (error) {
      const err = error as { data?: { message?: string }; error?: string };
      showToast.error(err?.data?.message || err?.error || `Failed to create ${staffType}`);
    }
  };

  const handleToggleOrderTrackingEmails = async () => {
    if (!notificationSettings) {
      return;
    }

    try {
      await updateNotificationSettings({
        orderTrackingEmailsEnabled: !notificationSettings.orderTrackingEmailsEnabled,
      }).unwrap();
      showToast.success("Notification setting updated");
    } catch {
      showToast.error("Failed to update notification setting");
    }
  };

  const columns = [
    {
      key: "username",
      header: "Username",
      className: "font-medium",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "role",
      header: "Role",
      render: (value: any) => {
        const roleName =
          typeof value === "string" ? value : value?.roleName || "N/A";
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
              value
            )}`}
          >
            {roleName.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "active",
      header: "Status",
      render: (value: unknown) => {
        const activeValue = value as boolean | undefined;
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              activeValue
            )}`}
          >
            {activeValue ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex gap-2">
          {row.designerId ? (
            <button
              type="button"
              onClick={() =>
                handleViewDesignerOrders(
                  row.designerId,
                  row.username || `Designer ${row.designerId}`
                )
              }
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Assigned Orders
            </button>
          ) : null}
          {canManageUsers ? (
            <>
              {row.userId > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(row)}
                    className={`text-sm ${
                      row.active
                        ? "text-orange-600 hover:text-orange-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {row.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(row.userId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">Read only</span>
          )}
        </div>
      ),
    },
  ];

  const filteredData = mergedUsers.filter((user: any) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && user.active) ||
      (statusFilter === "inactive" && !user.active);
    const userRoleName =
      typeof user.role === "string" ? user.role : user.role?.roleName || "";
    const matchesRole =
      !roleFilter || userRoleName.toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = [
    {
      label: "Total Users",
      value: mergedUsers.length.toString(),
    },
    {
      label: "Active Users",
      value: mergedUsers.filter((u: any) => u.active).length.toString(),
    },
    {
      label: "Admins",
      value: mergedUsers
        .filter((u: any) => {
          const roleName =
            typeof u.role === "string" ? u.role : u.role?.roleName || "";
          return roleName.toUpperCase() === "ADMIN";
        })
        .length.toString(),
    },
    {
      label: "Designers",
      value: mergedUsers
        .filter((u: any) => {
          const roleName =
            typeof u.role === "string" ? u.role : u.role?.roleName || "";
          return roleName.toUpperCase() === "DESIGNER";
        })
        .length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and permissions"
        actions={
          <div className="flex gap-3">
            {canManageUsers ? (
              <>
                <Button variant="outline" size="sm" onClick={() => handleOpenCreateStaff("manager")}>
                  Add Manager
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenCreateStaff("vendor")}>
                  Add Vendor
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenCreateStaff("designer")}>
                  Add Designer
                </Button>
              </>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = [
                  [
                    "User ID",
                    "Username",
                    "Email",
                    "Role",
                    "Status",
                    "Created At",
                  ].join(","),
                  ...mergedUsers.map((u: any) => {
                    const roleName =
                      typeof u.role === "string"
                        ? u.role
                        : u.role?.roleName || "";
                    return [
                      u.userId,
                      u.username,
                      u.email,
                      roleName,
                      u.active ? "Active" : "Inactive",
                      u.createdAt || "",
                    ].join(",");
                  }),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `users-${new Date().toISOString()}.csv`;
                a.click();
              }}
            >
              Export Users
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      {canManageUsers ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Important Order Tracking Emails</p>
            <p className="text-xs text-gray-500">Controls shipment/payment progress emails to customers</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleToggleOrderTrackingEmails}>
            {notificationSettings?.orderTrackingEmailsEnabled ? "Disable" : "Enable"}
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="CUSTOMER">Customer</option>
              <option value="DESIGNER">Designer</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading || designersLoading || vendorsLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading users...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No users found"
            onRowClick={(row) => {
              const userRow = row as { userId: number };
              if (userRow.userId <= 0) return;
              setSelectedUserId(userRow.userId);
              setShowUserDetailModal(true);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        variant="danger"
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={showUserDetailModal}
        userId={selectedUserId}
        onClose={() => {
          setShowUserDetailModal(false);
          setSelectedUserId(null);
        }}
      />

      <Modal
        isOpen={showDesignerOrdersModal}
        onClose={() => {
          setShowDesignerOrdersModal(false);
          setSelectedDesigner(null);
        }}
        showCloseButton
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedDesigner
              ? `${selectedDesigner.designerName} Assigned Orders`
              : "Assigned Orders"}
          </h2>

          {isLoadingDesignerOrders ? (
            <div className="py-8 text-center text-gray-500">Loading assigned orders...</div>
          ) : designerOrderItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No assigned order items found.</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {designerOrderItems.map((item) => (
                <div
                  key={item.orderItemId}
                  className="rounded-md border border-gray-200 p-3 text-sm"
                >
                  <div className="font-medium text-gray-900">
                    Order #{item.orderId ?? "N/A"} - Item #{item.orderItemId}
                  </div>
                  <div className="text-gray-600 mt-1">
                    Product: {item.productName || item.productId || "N/A"}
                  </div>
                  <div className="text-gray-600">
                    Quantity: {item.quantity ?? "N/A"}
                  </div>
                  <div className="text-gray-600">
                    Order Status: {item.orderStatus || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        showCloseButton
        className="max-w-lg"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Create {staffType}</h2>
          <input
            type="text"
            placeholder="Username"
            value={staffForm.username}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            value={staffForm.email}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            placeholder="Temporary password"
            value={staffForm.password}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={staffForm.phoneNumber}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Display name (optional)"
            value={staffForm.displayName}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, displayName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Contact info (optional)"
            value={staffForm.contactInfo}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, contactInfo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreateStaffModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStaff}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
