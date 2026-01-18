"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { Menu, NotificationIcon } from "./assets";

interface DasboardHeaderProps {
  onMenuClick?: () => void;
}

const DasboardHeader: React.FC<DasboardHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();

  // Static user data (replace with API call when ready)
  const user = {
    name: "John Doe", // Replace with actual user data
  };

  // Generate Dicebear avatar URL from user's name
  const avatarUrl = useMemo(() => {
    if (!user?.name) {
      return "https://api.dicebear.com/9.x/thumbs/svg?seed=User";
    }

    // Split name into first and last name, or use full name as seed
    const nameParts = user.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    const seed = `${firstName} ${lastName}`;

    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
  }, [user?.name]);

  return (
    <div className="flex px-4 py-2 md:px-[40px] h-[60px] justify-between items-center">
      <Image
        src="/logo.svg"
        alt="Unlokr"
        width={180}
        height={120}
        className="h-6 w-auto md:h-[60px] md:w-[180px]"
        priority
      />

      <div className="flex items-center divide-x divide-gray-200 gap-4">
        <button type="button" onClick={() => router.push("/notification")}>
          <NotificationIcon className="w-8 h-6 text-black" />
        </button>
        <button
          type="button"
          className="rounded-full hover:bg-gray-100"
          onClick={() => router.push("/account")}
          title={user?.name || "User"}
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
