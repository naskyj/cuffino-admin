"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui";
import {
  AppNotification,
  NotificationType,
  useDeleteNotificationMutation,
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import PageHeader from "../_components/PageHeader";

// The bell icon in the dashboard header used to push to /notification, a route that never
// existed - this is the page it should always have been pointing at. The feed itself is per
// recipient and comes from the backend's /notifications/mine, so an admin and a manager each see
// their own read/unread state rather than a single shared inbox.

const PAGE_SIZE = 20;

const TYPE_STYLE: Record<NotificationType, { label: string; className: string }> = {
  ORDER_PLACED: { label: "New order", className: "bg-blue-100 text-blue-800" },
  ORDER_STATUS: { label: "Order", className: "bg-indigo-100 text-indigo-800" },
  PAYMENT: { label: "Payment", className: "bg-green-100 text-green-800" },
  RETURN: { label: "Return", className: "bg-orange-100 text-orange-800" },
  SUPPORT: { label: "Support", className: "bg-purple-100 text-purple-800" },
  MEASUREMENT: { label: "Measurement", className: "bg-teal-100 text-teal-800" },
  SYSTEM: { label: "System", className: "bg-gray-100 text-gray-700" },
};

const FILTERS: { value: NotificationType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ORDER_PLACED", label: "New orders" },
  { value: "ORDER_STATUS", label: "Orders" },
  { value: "PAYMENT", label: "Payments" },
  { value: "RETURN", label: "Returns" },
  { value: "SUPPORT", label: "Support" },
];

const formatWhen = (iso: string): string => {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";

  const minutes = Math.floor((Date.now() - then.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d ago`;
  // Past a week, a relative label stops being useful - show the actual date and time, which is
  // also the fix for support tickets having shown a bare date with no time.
  return then.toLocaleString();
};

const NotificationsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "ALL">("ALL");

  const { data, isLoading, isFetching, refetch } = useGetMyNotificationsQuery({
    unreadOnly,
    page,
    size: PAGE_SIZE,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.notifications ?? [];
  const visible =
    typeFilter === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.read) {
      try {
        await markRead(notification.notificationId).unwrap();
      } catch {
        // Opening the thing the notification points at matters more than the read flag -
        // don't block navigation on it.
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAll = async () => {
    try {
      const result = await markAllRead().unwrap();
      showToast.success(
        result.markedRead > 0
          ? `Marked ${result.markedRead} notification${result.markedRead === 1 ? "" : "s"} read`
          : "Nothing left to mark"
      );
    } catch {
      showToast.error("Couldn't mark notifications read");
    }
  };

  const handleDelete = async (event: React.MouseEvent, notificationId: number) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId).unwrap();
    } catch {
      showToast.error("Couldn't remove that notification");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={
          data
            ? `${data.unreadCount} unread of ${data.totalElements} total`
            : "Your activity feed"
        }
        actions={
          <Button
            onClick={handleMarkAll}
            disabled={isMarkingAll || (data?.unreadCount ?? 0) === 0}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Mark all read
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setTypeFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === filter.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}

        <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => {
              setUnreadOnly(event.target.checked);
              setPage(0);
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          Unread only
        </label>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading notifications...
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">Nothing here yet</p>
          <p className="mt-1 text-sm text-gray-500">
            {unreadOnly || typeFilter !== "ALL"
              ? "No notifications match this filter."
              : "New orders, payments, returns and support tickets will show up here."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {visible.map((notification) => {
            const style = TYPE_STYLE[notification.type] ?? TYPE_STYLE.SYSTEM;
            return (
              <li key={notification.notificationId}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpen(notification)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpen(notification);
                    }
                  }}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                    notification.read ? "" : "bg-blue-50/40"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      notification.read ? "bg-transparent" : "bg-blue-600"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${style.className}`}
                      >
                        {style.label}
                      </span>
                      <p
                        className={`text-sm ${
                          notification.read
                            ? "text-gray-700"
                            : "font-semibold text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </p>
                    </div>
                    {notification.message && (
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatWhen(notification.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, notification.notificationId)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                    aria-label={`Remove notification: ${notification.title}`}
                  >
                    &times;
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={page === 0 || isFetching}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {data?.totalPages}
          </span>
          <Button
            onClick={() => setPage((current) => current + 1)}
            disabled={page + 1 >= (data?.totalPages ?? 1) || isFetching}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => refetch()}
        className="text-xs text-gray-500 underline hover:text-gray-700"
      >
        Refresh
      </button>
    </div>
  );
};

export default NotificationsPage;
