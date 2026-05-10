"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { SideBarProps } from "@/types/sidebar";

import { LogoutIcon } from "./assets";

const SideBar: React.FC<SideBarProps> = ({
  items,
  className,
  userProfile,
  onLogout,
}) => {
  const pathname = usePathname();

  const isActiveRoute = (route: string) => pathname === route;

  return (
    <div
      className={cn(
        "flex flex-col justify-between h-full bg-white w-64 border-r border-gray-200",
        className
      )}
    >
      {/* Navigation Items */}
      <nav className="flex flex-col py-6 space-y-2 overflow-hidden hover:overflow-y-auto">
        {items.map((item) => {
          const isActive = isActiveRoute(item.route);

          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group",
                "hover:bg-gray-50 focus:outline-none",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 flex items-center justify-center transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              >
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive
                    ? "text-primary"
                    : "text-gray-600 group-hover:text-gray-900"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="border-t border-gray-200 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 mx-2 mt-2 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}

      {/* User Profile Section */}
      {userProfile && (
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {userProfile.avatar ? (
                <Image
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile.name}
              </p>
              {userProfile.email && (
                <p className="text-xs text-gray-500 truncate">
                  {userProfile.email}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
