// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useMemo, useRef } from "react";

// import { useClickOutside } from "@/hooks";
// import { cn } from "@/lib/utils";
// import { useAppSelector } from "@/store/hooks";
// import { SideBarProps } from "@/types/sidebar";

// import { LogoutIcon } from "./assets";

// interface MobileSideBarProps extends SideBarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const MobileSideBar: React.FC<MobileSideBarProps> = ({
//   items,
//   className,
//   userProfile,
//   onLogout,
//   isOpen,
//   onClose,
// }) => {
//   const pathname = usePathname();
//   const sidebarRef = useRef<HTMLDivElement>(null);
//   const { user } = useAppSelector((state) => state.auth);

//   const isActiveRoute = (route: string) => pathname === route;

//   // Generate Dicebear avatar URL from user's name
//   const avatarUrl = useMemo(() => {
//     if (!user?.creator?.first_name) {
//       return "https://api.dicebear.com/9.x/thumbs/svg?seed=User";
//     }

//     // Split name into first and last name, or use full name as seed
//     const firstName = user.creator.first_name || "User";
//     const lastName = user.creator.last_name || firstName;
//     const seed = `${firstName} ${lastName}`;

//     return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
//   }, [user?.creator?.first_name, user?.creator?.last_name]);

//   // Handle click outside to close sidebar
//   useClickOutside(sidebarRef, () => {
//     if (isOpen) {
//       onClose();
//     }
//   });

//   return (
//     <>
//       {/* Backdrop */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
//       )}

//       {/* Mobile Sidebar */}
//       <div
//         ref={sidebarRef}
//         className={cn(
//           "fixed top-0 left-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
//           isOpen ? "translate-x-0" : "-translate-x-full",
//           className
//         )}
//       >
//         <div className="flex flex-col h-full">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-gray-200">
//             <Image src="/logo.svg" alt="Unlokr" width={120} height={40} />
//             <button
//               type="button"
//               onClick={onClose}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//               aria-label="Close sidebar"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* User Profile Section */}
//           {userProfile && (
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
//                   {user?.creator?.profile_picture ? (
//                     <Image
//                       src={user?.creator?.profile_picture}
//                       alt={user?.creator?.first_name}
//                       width={48}
//                       height={48}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <img
//                       src={avatarUrl}
//                       alt={user?.creator?.first_name}
//                       width={48}
//                       height={48}
//                       className="w-full h-full object-cover rounded-lg"
//                     />
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">
//                     {user?.creator?.first_name} {user?.creator?.last_name}
//                   </p>
//                   <div className="max-w-[160px] overflow-hidden">
//                     <p
//                       className="text-sm text-gray-500 truncate"
//                       title={user?.creator?.email}
//                     >
//                       {user?.creator?.email}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Navigation Items */}
//           <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
//             {items.map((item) => {
//               const isActive = isActiveRoute(item.route);

//               return (
//                 <Link
//                   key={item.id}
//                   href={item.route}
//                   onClick={() => {
//                     item.onClick?.();
//                     onClose(); // Close sidebar when navigating
//                   }}
//                   className={cn(
//                     "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200",
//                     "hover:bg-gray-50 focus:outline-none",
//                     isActive
//                       ? "bg-primary/10 text-primary border-r-2 border-primary"
//                       : "text-gray-600 hover:text-gray-900"
//                   )}
//                 >
//                   <div
//                     className={cn(
//                       "w-5 h-5 flex items-center justify-center transition-colors",
//                       isActive ? "text-primary" : "text-gray-500"
//                     )}
//                   >
//                     {item.icon}
//                   </div>
//                   <span className="text-sm font-medium">{item.title}</span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Logout Button */}
//           {onLogout && (
//             <div className="p-4 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => {
//                   onLogout();
//                   onClose();
//                 }}
//                 className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full"
//               >
//                 <LogoutIcon className="w-5 h-5" />
//                 <span className="text-sm font-medium">Logout</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default MobileSideBar;
