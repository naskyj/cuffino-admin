// Common utility types
import React from "react";

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Generic response wrapper
export interface ResponseWrapper<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (_value: unknown) => string | null;
  };
}

// Theme types
export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
}

// Toast/Notification types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Table types
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (_value: unknown, _record: T, _index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (_page: number, _pageSize: number) => void;
  };
  rowKey?: keyof T | ((_record: T) => string);
  onRow?: (
    _record: T,
    _index: number
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
  };
}

// Filter types
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "text" | "number";
  options?: FilterOption[];
  placeholder?: string;
}

// Sort types
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

// Date/Time types
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// File types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
}

// Permission types
export type Permission =
  | "read:users"
  | "write:users"
  | "delete:users"
  | "read:posts"
  | "write:posts"
  | "delete:posts"
  | "read:comments"
  | "write:comments"
  | "delete:comments"
  | "admin:all";

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number;
  strategy: "lru" | "fifo" | "ttl";
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: Date;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}
