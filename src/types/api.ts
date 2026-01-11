// Base API response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  status: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorAccountDetails {
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  profile_picture: string;
  dob: string;
  kyc_verified: boolean;
  subscribed: boolean;
}

export interface AuthResponse {
  creator: CreatorAccountDetails;
  wallet: {
    id: string;
    balance: number;
    total_earned: number;
    banks: {
      curr: string;
      bank_code: string;
      bank_name: string;
      acc_no: string;
      id: number;
      acc_name: string;
    }[];
    created_at: string;
    updated_at: string;
  };
  total_earned: number;
  total_uploads: number;
}

export interface VerifyMagicLinkResponse {
  creator_account_details: CreatorAccountDetails;
  pending_account_details: {
    email: string;
    token: string;
    expires_at: string;
    dob: string;
    kyc_verified: boolean;
  };
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  bio?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showLastSeen: boolean;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Post related types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: User;
  tags: string[];
  category: string;
  status: PostStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  views: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  category: string;
  status?: PostStatus;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  status?: PostStatus;
}

// Comment related types
export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface UploadResponse {
  file: FileUpload;
  message: string;
}

// Search types
export interface SearchParams {
  query: string;
  type?: "users" | "posts" | "comments" | "all";
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  };
  pagination?: PaginationParams;
}

export interface SearchResult<T> {
  results: T[];
  total: number;
  query: string;
  filters: SearchParams["filters"];
  pagination: PaginatedResponse<T>["pagination"];
}

// Enums
export type UserRole = "admin" | "moderator" | "user" | "guest";

export type PostStatus = "draft" | "published" | "archived" | "deleted";

// API endpoint types
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
    verifyEmail: string;
  };
  users: {
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
    profile: string;
    preferences: string;
  };
  posts: {
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
    like: string;
    unlike: string;
  };
  comments: {
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
    like: string;
    unlike: string;
  };
  upload: {
    image: string;
    file: string;
  };
  search: {
    global: string;
    users: string;
    posts: string;
  };
}
