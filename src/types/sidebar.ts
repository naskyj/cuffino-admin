import { ReactNode } from "react";

export interface SideBarItem {
  id: string;
  title: string;
  route: string;
  icon: ReactNode;
  /** Tailwind classes for the coloured chip behind the icon, e.g. "bg-blue-50 text-blue-600". */
  iconClassName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SideBarProps {
  items: SideBarItem[];
  className?: string;
  userProfile?: {
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  };
  onLogout?: () => void;
}
