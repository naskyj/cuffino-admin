"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import ConfirmDialog from "@/components/ConfirmDialog";
import { showToast } from "@/utilities/toast";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/store/api";
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

  const { data: users = [], isLoading, refetch } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const getStatusColor = (isActive: boolean | undefined) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getRoleColor = (role: any) => {
    const roleName = typeof role === "string" ? role : role?.roleName || "";
    switch (roleName.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "CUSTOMER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      } catch (error) {
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
    } catch (error) {
      showToast.error("Failed to update user status");
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
        const roleName = typeof value === "string" ? value : value?.roleName || "N/A";
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
          <button
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
            onClick={() => handleDeleteClick(row.userId)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filteredData = users.filter((user: any) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || (statusFilter === "active" && user.active) || (statusFilter === "inactive" && !user.active);
    const userRoleName = typeof user.role === "string" ? user.role : user.role?.roleName || "";
    const matchesRole = !roleFilter || userRoleName.toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = [
    {
      label: "Total Users",
      value: users.length.toString(),
    },
    {
      label: "Active Users",
      value: users.filter((u: any) => u.active).length.toString(),
    },
    {
      label: "Admins",
      value: users.filter((u: any) => {
        const roleName = typeof u.role === "string" ? u.role : u.role?.roleName || "";
        return roleName.toUpperCase() === "ADMIN";
      }).length.toString(),
    },
    {
      label: "Customers",
      value: users.filter((u: any) => {
        const roleName = typeof u.role === "string" ? u.role : u.role?.roleName || "";
        return roleName.toUpperCase() === "CUSTOMER";
      }).length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and permissions"
        actions={
          <div className="flex gap-3">
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
                  ...users.map((u: any) => {
                    const roleName = typeof u.role === "string" ? u.role : u.role?.roleName || "";
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
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
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
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
    </div>
  );
};

export default UsersPage;
