// Authentication cookie names
export const AUTH_COOKIE_NAMES = {
  token: "auth_token",
  refreshToken: "refresh_token",
  userDetails: "user_details",
} as const;

// Purchase cookie names
export const PURCHASE_COOKIE_NAMES = {
  purchaserEmail: "purchaser_email",
  purchaseProductId: "purchase_product_id",
  purchaseTransactionId: "purchase_transaction_id",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
  },
  users: {
    list: "/users",
    get: "/users",
    create: "/users",
    update: "/users",
    delete: "/users",
    profile: "/users/profile",
    preferences: "/users/preferences",
  },
  posts: {
    list: "/posts",
    get: "/posts",
    create: "/posts",
    update: "/posts",
    delete: "/posts",
    like: "/posts/like",
    unlike: "/posts/unlike",
  },
  comments: {
    list: "/comments",
    get: "/comments",
    create: "/comments",
    update: "/comments",
    delete: "/comments",
    like: "/comments/like",
    unlike: "/comments/unlike",
  },
  upload: {
    image: "/upload/image",
    file: "/upload/file",
  },
  search: {
    global: "/search",
    users: "/search/users",
    posts: "/search/posts",
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
  GUEST: "guest",
} as const;

// Post statuses
export const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

// Theme options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

// Toast types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "text/plain",
    "application/msword",
  ],
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: "user_profile",
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
  LANGUAGE: "language",
  SIDEBAR_STATE: "sidebar_state",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  SIDEBAR_OPEN: "sidebar_open",
  RECENT_SEARCHES: "recent_searches",
  DRAFT_POSTS: "draft_posts",
} as const;

// API response messages
export const API_MESSAGES = {
  SUCCESS: {
    LOGIN: "Login successful",
    LOGOUT: "Logout successful",
    REGISTER: "Registration successful",
    UPDATE: "Update successful",
    DELETE: "Delete successful",
    CREATE: "Create successful",
  },
  ERROR: {
    INVALID_CREDENTIALS: "Invalid credentials",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    NOT_FOUND: "Resource not found",
    VALIDATION_ERROR: "Validation error",
    SERVER_ERROR: "Internal server error",
    NETWORK_ERROR: "Network error",
  },
} as const;

// Form validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_WITH_TIME: "yyyy-MM-dd HH:mm:ss",
  ISO: "yyyy-MM-ddTHH:mm:ss.SSSZ",
} as const;

// Dummy token for development/testing
export const DUMMY_TOKEN = "dummy_jwt_token_for_development_12345";

// Country options for select dropdowns
export const COUNTRY_OPTIONS = [
  { value: "ng", label: "Nigeria" },
  { value: "ke", label: "Kenya" },
  { value: "gh", label: "Ghana" },
  { value: "za", label: "South Africa" },
] as { value: string; label: string }[];

// Country values for validation
export const COUNTRY_VALUES = COUNTRY_OPTIONS.map((option) => option.value);

// Currency options based on supported countries
export const CURRENCY_OPTIONS = [
  {
    value: "NGN",
    label: "Nigeria (Naira)",
    currency: "NGN",
    country: "Nigeria",
    countryCode: "ng",
  },
  {
    value: "KES",
    label: "Kenya (Shilling)",
    currency: "KES",
    country: "Kenya",
    countryCode: "ke",
  },
  {
    value: "GHS",
    label: "Ghana (Cedi)",
    currency: "GHS",
    country: "Ghana",
    countryCode: "gh",
  },
  {
    value: "ZAR",
    label: "South Africa (Rand)",
    currency: "ZAR",
    country: "South Africa",
    countryCode: "za",
  },
] as {
  value: string;
  label: string;
  currency: string;
  country: string;
  countryCode: string;
}[];

// Currency values for validation
export const CURRENCY_VALUES = CURRENCY_OPTIONS.map(
  (option) => option.currency
);

// Environment variables
export const ENV_VARS = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://unlokr.app",
  CLOUDINARY_API_KEY:
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "1234567890",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  FLUTTERWAVE_API_KEY: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  // Firebase config
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
} as const;
