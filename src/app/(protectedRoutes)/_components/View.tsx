"use client";

import React, { useEffect, useState } from "react";
import {
  Boxes,
  Calculator,
  CreditCard,
  Headset,
  LayoutDashboard,
  RotateCcw,
  Scissors,
  Shirt,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useDispatch } from "react-redux";

import { Modal } from "@/components/ui";
import { logout } from "@/store/slices/authSlice";
import {
  broadcastLogout,
  clearAllAuthCookies,
  getUserDetailsFromCookie,
  getUserRoleFromCookie,
  isAuthenticated,
  onLogoutBroadcast,
} from "@/utilities";

import DasboardHeader from "./DasboardHeader";
import MobileSideBar from "./MobileSideBar";
import SideBar from "./SideBar";

const View = ({ children }: { children: React.ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const userDetails = getUserDetailsFromCookie();
    if (userDetails?.creator) {
      setUserProfile({
        name:
          userDetails.creator.first_name || userDetails.creator.email || "User",
        email: userDetails.creator.email,
        avatar: userDetails.creator.profile_picture,
        role: getUserRoleFromCookie() || undefined,
      });
    }
  }, []);

  useEffect(() => {
    // Browsers restore a page from bfcache (back/forward cache) on history navigation without
    // re-running any JS or hitting the server - meaning the middleware's auth check never runs,
    // so hitting "back" after logout could show a fully-interactive snapshot of a protected page.
    // event.persisted is true specifically when the page came from bfcache rather than a fresh load.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !isAuthenticated()) {
        window.location.replace("/");
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // Logging out in one tab only clears cookies + that tab's own in-memory Redux state - every
    // other open tab keeps running on its stale state until it happens to make a new request.
    // BroadcastChannel lets the logging-out tab tell every other same-origin tab to follow suit
    // immediately rather than staying usable until a manual refresh.
    const unsubscribe = onLogoutBroadcast(() => {
      window.location.replace("/");
    });

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      unsubscribe();
    };
  }, []);

  // Pricing API is ADMIN/MANAGER only; hide the entry for every other role.
  const userRole = (userProfile?.role || "").toUpperCase();
  const canSeePricing = userRole === "ADMIN" || userRole === "MANAGER";

  const sidebarItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      route: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      iconClassName: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "orders",
      title: "Orders",
      route: "/orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      iconClassName: "bg-blue-50 text-blue-600",
    },
    {
      id: "products",
      title: "Products",
      route: "/products",
      icon: <Shirt className="w-4 h-4" />,
      iconClassName: "bg-pink-50 text-pink-600",
    },
    ...(canSeePricing
      ? [
          {
            id: "pricing",
            title: "Pricing",
            route: "/pricing",
            icon: <Calculator className="w-4 h-4" />,
            iconClassName: "bg-lime-50 text-lime-600",
          },
        ]
      : []),
    {
      id: "production",
      title: "Production",
      route: "/production",
      icon: <Scissors className="w-4 h-4" />,
      iconClassName: "bg-violet-50 text-violet-600",
    },
    {
      id: "inventory",
      title: "Inventory",
      route: "/inventory",
      icon: <Boxes className="w-4 h-4" />,
      iconClassName: "bg-amber-50 text-amber-600",
    },
    {
      id: "logistics",
      title: "Logistics",
      route: "/logistics",
      icon: <Truck className="w-4 h-4" />,
      iconClassName: "bg-cyan-50 text-cyan-600",
    },
    {
      id: "returns",
      title: "Returns",
      route: "/returns",
      icon: <RotateCcw className="w-4 h-4" />,
      iconClassName: "bg-orange-50 text-orange-600",
    },
    {
      id: "payments",
      title: "Payments",
      route: "/payments",
      icon: <CreditCard className="w-4 h-4" />,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "support",
      title: "Support",
      route: "/support",
      icon: <Headset className="w-4 h-4" />,
      iconClassName: "bg-rose-50 text-rose-600",
    },
    {
      id: "users",
      title: "Users",
      route: "/users",
      icon: <Users className="w-4 h-4" />,
      iconClassName: "bg-sky-50 text-sky-600",
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearAllAuthCookies();
    dispatch(logout());
    broadcastLogout();
    setShowLogoutModal(false);
    // A hard navigation, not router.push: this guarantees a real request that the middleware
    // sees (so the token cookie is confirmed gone before anything protected could render again),
    // rather than an in-app client-side transition.
    window.location.href = "/";
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen">
      <DasboardHeader onMenuClick={toggleMobileSidebar} />

      {/* Mobile Sidebar */}
      <MobileSideBar
        items={sidebarItems}
        onLogout={handleLogout}
        userProfile={userProfile || undefined}
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />

      <div className="flex h-[calc(100vh - 60px)] ">
        {/* Desktop Sidebar */}
        <div className=" h-[calc(100vh - 60px)] hidden lg:block">
          <SideBar
            items={sidebarItems}
            onLogout={handleLogout}
            userProfile={userProfile || undefined}
          />
        </div>

        {/* Main Content */}
        <div
          className="w-full px-4 overflow-y-auto py-6 border"
          style={{ height: "calc(100vh - 60px)" }}
        >
          {children}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        showCloseButton={false}
        closeOnOverlayClick={false}
        className="max-w-sm"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Confirm Logout
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to logout? You will need to sign in again to
            access your account.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default View;
