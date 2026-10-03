import { baseSlice } from "./apiSlice";

// Must match the backend notification/model/NotificationType enum exactly.
export type NotificationType =
  | "ORDER_STATUS"
  | "ORDER_PLACED"
  | "PAYMENT"
  | "RETURN"
  | "SUPPORT"
  | "MEASUREMENT"
  | "SYSTEM";

export interface AppNotification {
  notificationId: number;
  type: NotificationType;
  title: string;
  message?: string;
  /** Client-side route this deep-links to, e.g. /orders/42. May be absent. */
  link?: string;
  referenceType?: string;
  referenceId?: number;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPage {
  notifications: AppNotification[];
  unreadCount: number;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export const notificationApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Note there is no userId parameter anywhere here: the backend resolves the recipient from
    // the JWT, so the feed is whoever the token says you are and cannot be pointed at anyone else.
    getMyNotifications: builder.query<
      NotificationPage,
      { unreadOnly?: boolean; page?: number; size?: number } | void
    >({
      query: (args) => {
        const { unreadOnly = false, page = 0, size = 20 } = args || {};
        return `/notifications/mine?unreadOnly=${unreadOnly}&page=${page}&size=${size}`;
      },
      providesTags: ["Notification"],
    }),

    getUnreadNotificationCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/notifications/mine/unread-count",
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<AppNotification, number>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<{ markedRead: number }, void>({
      query: () => ({
        url: "/notifications/mine/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
