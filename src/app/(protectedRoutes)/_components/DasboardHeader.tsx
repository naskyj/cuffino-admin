"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetUnreadNotificationCountQuery } from "@/store/api";
import { getUserDetailsFromCookie, getUserRoleFromCookie } from "@/utilities";

import { Menu, NotificationIcon } from "./assets";

interface DasboardHeaderProps {
  onMenuClick?: () => void;
}

const DasboardHeader: React.FC<DasboardHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();

  // Was hardcoded to "John Doe" with a "replace with API call when ready" note, which meant the
  // avatar tooltip showed the same fake name for every signed-in member of staff.
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);

  useEffect(() => {
    const details = getUserDetailsFromCookie();
    if (details?.creator) {
      setUser({
        name: details.creator.username || details.creator.email || "User",
        role: getUserRoleFromCookie() || undefined,
      });
    }
  }, []);

  // Poll rather than push: there is no websocket/SSE channel in this stack, and a 60s refresh is
  // enough for an operations console without hammering the API.
  const { data: unread } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnMountOrArgChange: true,
  });
  const unreadCount = unread?.unreadCount ?? 0;

  // Generate Dicebear avatar URL from user's name
  const avatarUrl = useMemo(() => {
    const seed = user?.name?.trim() || "User";
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
  }, [user?.name]);

  return (
    <div className="flex px-4 py-2 md:px-[40px] h-[60px] justify-between items-center">
      <Image
        src="/logo.svg"
        alt="Cuffino"
        width={180}
        height={120}
        className="h-6 w-auto md:h-[60px] md:w-[180px]"
        priority
      />

      <div className="flex items-center divide-x divide-gray-200 gap-4">
        {/* Routed to /notification (singular) and /account, neither of which was ever a page in
            this app - both 404'd. These now point at the real routes. */}
        <button
          type="button"
          onClick={() => router.push("/notifications")}
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <NotificationIcon className="w-8 h-6 text-black" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="rounded-full hover:bg-gray-100"
          onClick={() => router.push("/profile")}
          title={user?.name ? `${user.name}${user.role ? ` (${user.role})` : ""}` : "My profile"}
          aria-label="My profile"
        >
          <Image
            src={avatarUrl}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
        </button>
        <button type="button" className="block lg:hidden" onClick={onMenuClick}>
          <Menu className="w-8 h-6 text-black" />
        </button>
      </div>
    </div>
  );
};

export default DasboardHeader;
