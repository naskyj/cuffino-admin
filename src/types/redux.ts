import { Comment, Post, User, UserPreferences } from "./api";
import { AppDispatch, RootState } from "./store";

// Redux state types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  profile: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  modals: {
    [key: string]: boolean;
  };
  toasts: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }[];
  loading: {
    [key: string]: boolean;
  };
}

// Action types
export interface BaseAction {
  type: string;
  payload?: unknown;
  meta?: unknown;
  error?: boolean;
}

// Async action types
export interface AsyncAction<T = unknown> extends BaseAction {
  payload: {
    request: T;
  };
}

export interface AsyncSuccessAction<T = unknown> extends BaseAction {
  payload: {
    response: T;
  };
}

export interface AsyncErrorAction extends BaseAction {
  payload: {
    error: string;
  };
  error: true;
}

// Thunk types
export type AppThunk<ReturnType = void> = (
  _dispatch: AppDispatch,
  _getState: () => RootState
) => ReturnType;

export interface AsyncThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}

// Selector types
export type Selector<T> = (_state: RootState) => T;
export type ParametricSelector<T, P> = (_state: RootState, _params: P) => T;

// Hook types
export interface UseSelectorHook {
  <T>(_selector: Selector<T>): T;
  <T, P>(_selector: ParametricSelector<T, P>, _params: P): T;
}

// RTK Query types
export interface ApiErrorResponse {
  data: {
    message: string;
    code?: string;
    details?: unknown;
  };
  status: number;
}

export interface PaginatedApiResponse<T> {
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

// Form types for Redux
export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormAction {
  type: string;
  field?: string;
  value?: unknown;
  error?: string;
  payload?: unknown;
}

// Cache types for Redux
export interface CacheState {
  [key: string]: {
    data: unknown;
    timestamp: number;
    ttl: number;
  };
}

// Persist types
export interface PersistConfig {
  key: string;
  storage: unknown;
  whitelist?: string[];
  blacklist?: string[];
  transforms?: unknown[];
  version?: number;
  migrate?: (_state: unknown, _version: number) => unknown;
}

// Middleware types
export interface MiddlewareConfig {
  serializableCheck?: {
    ignoredActions?: string[];
    ignoredActionsPaths?: string[];
    ignoredPaths?: string[];
  };
  immutableCheck?: {
    ignoredPaths?: string[];
  };
}

// DevTools types
export interface DevToolsConfig {
  name?: string;
  actionSanitizer?: (_action: unknown) => unknown;
  stateSanitizer?: (_state: unknown) => unknown;
  trace?: boolean;
  traceLimit?: number;
}

// Store enhancer types
export interface StoreEnhancer {
  (
    _createStore: unknown
  ): (_reducer: unknown, _preloadedState?: unknown) => unknown;
}

// Reducer types
export type Reducer<S = unknown, A = unknown> = (_state: S, _action: A) => S;
export type ReducersMapObject<S = unknown, A = unknown> = {
  [K in keyof S]: Reducer<S[K], A>;
};

// Action creator types
export interface ActionCreator<T = unknown> {
  (..._args: unknown[]): T;
  type: string;
}

export interface AsyncActionCreator<T = unknown> {
  pending: ActionCreator;
  fulfilled: ActionCreator<T>;
  rejected: ActionCreator;
  type: string;
}

// Slice types
export interface SliceState {
  [key: string]: unknown;
}

export interface SliceCaseReducers<S = unknown> {
  [K: string]: (_state: S, _action: unknown) => S | void;
}

export interface SliceOptions<S = unknown, N = string> {
  name: N;
  initialState: S;
  reducers: SliceCaseReducers<S>;
  extraReducers?: (_builder: unknown) => void;
}

// Entity adapter types
export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
}

export interface EntityAdapter<T> {
  getInitialState(): EntityState<T>;
  getInitialState<S extends Record<string, unknown>>(
    _additionalState: S
  ): EntityState<T> & S;
  addOne<S extends EntityState<T>>(_state: S, _entity: T): S;
  addMany<S extends EntityState<T>>(_state: S, _entities: T[]): S;
  setOne<S extends EntityState<T>>(_state: S, _entity: T): S;
  setMany<S extends EntityState<T>>(_state: S, _entities: T[]): S;
  setAll<S extends EntityState<T>>(_state: S, _entities: T[]): S;
  removeOne<S extends EntityState<T>>(_state: S, _id: string): S;
  removeMany<S extends EntityState<T>>(_state: S, _ids: string[]): S;
  removeAll<S extends EntityState<T>>(_state: S): S;
  updateOne<S extends EntityState<T>>(
    _state: S,
    _update: { id: string; changes: Partial<T> }
  ): S;
  updateMany<S extends EntityState<T>>(
    _state: S,
    _updates: { id: string; changes: Partial<T> }[]
  ): S;
  upsertOne<S extends EntityState<T>>(_state: S, _entity: T): S;
  upsertMany<S extends EntityState<T>>(_state: S, _entities: T[]): S;
}
