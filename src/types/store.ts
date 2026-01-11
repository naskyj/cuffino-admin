// Store-specific types to avoid circular dependencies
// These types are used by the store but don't depend on the store itself

export interface AppDispatch {
  <T extends (..._args: unknown[]) => unknown>(_thunk: T): ReturnType<T>;
  <A extends { type: string }>(_action: A): A;
}

export interface RootState {
  auth: {
    user: unknown | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  };
  user: {
    profile: unknown | null;
    preferences: unknown | null;
    isLoading: boolean;
    error: string | null;
  };
  posts: {
    posts: unknown[];
    currentPost: unknown | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  ui: {
    theme: "light" | "dark" | "system";
    sidebarOpen: boolean;
    modals: Record<string, boolean>;
    toasts: {
      id: string;
      type: "success" | "error" | "warning" | "info";
      message: string;
      duration?: number;
    }[];
    loading: Record<string, boolean>;
  };
  api: {
    queries: Record<string, unknown>;
    mutations: Record<string, unknown>;
    subscriptions: Record<string, unknown>;
    provided: Record<string, unknown>;
    config: {
      focused: boolean;
      keepUnusedDataFor: number;
      middlewareRegistered: boolean;
      online: boolean;
      refetchOnFocus: boolean;
      refetchOnMountOrArgChange: boolean;
      refetchOnReconnect: boolean;
    };
  };
}
