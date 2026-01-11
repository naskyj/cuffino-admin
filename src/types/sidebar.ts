import { ReactNode } from "react";

export interface SideBarItem {
  id: string;
  title: string;
  route: string;
  icon: ReactNode;
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
  };
  onLogout?: () => void;
}
