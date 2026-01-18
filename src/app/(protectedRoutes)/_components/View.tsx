"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { Modal } from "@/components/ui";
import { logout } from "@/store/slices/authSlice";
import { clearAllAuthCookies, getUserDetailsFromCookie } from "@/utilities";

import {
  DashboardIcon,
  LogisticsIcon,
  OrdersIcon,
  PaymentsIcon,
  ProductsIcon,
  User,
} from "./assets";
import DasboardHeader from "./DasboardHeader";
// import MobileSideBar from "./MobileSideBar";
import SideBar from "./SideBar";

const View = ({ children }: { children: React.ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email?: string;
    avatar?: string;
  } | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const userDetails = getUserDetailsFromCookie();
    if (userDetails?.creator) {
      setUserProfile({
        name:
          userDetails.creator.first_name ||
          userDetails.creator.email ||
          "User",
        email: userDetails.creator.email,
        avatar: userDetails.creator.profile_picture,
      });
    }
  }, []);

  const sidebarItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      route: "/dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
    },
    {
      id: "orders",
      title: "Orders",
      route: "/orders",
      icon: <OrdersIcon className="w-5 h-5" />,
    },
    {
      id: "products",
      title: "Products",
      route: "/products",
      icon: <ProductsIcon className="w-5 h-5" />,
    },
    {
      id: "production",
      title: "Production",
      route: "/production",
      icon: <ProductsIcon className="w-5 h-5" />,
    },
    {
      id: "inventory",
      title: "Inventory",
      route: "/inventory",
      icon: <ProductsIcon className="w-5 h-5" />,
    },
    {
      id: "logistics",
      title: "Logistics",
      route: "/logistics",
      icon: <LogisticsIcon className="w-5 h-5" />,
    },
    {
      id: "returns",
      title: "Returns",
      route: "/returns",
      icon: <OrdersIcon className="w-5 h-5" />,
    },
    {
      id: "payments",
      title: "Payments",
      route: "/payments",
      icon: <PaymentsIcon className="w-5 h-5" />,
    },
    {
      id: "users",
      title: "Users",
      route: "/users",
      icon: <User className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearAllAuthCookies();
    dispatch(logout());
    setShowLogoutModal(false);
    router.push("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // const closeMobileSidebar = () => {
  //   setIsMobileSidebarOpen(false);
  // };

  return (
    <div className="h-screen">
      <DasboardHeader onMenuClick={toggleMobileSidebar} />

      {/* Mobile Sidebar */}
      {/* <MobileSideBar
        items={sidebarItems}
        onLogout={handleLogout}
        userProfile={userProfile}
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      /> */}

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
