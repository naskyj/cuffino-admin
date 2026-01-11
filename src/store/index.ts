import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import your API slices
import { baseSlice } from "./api/apiSlice";
// Import your feature slices
import authSlice from "./slices/authSlice";
import userSlice from "./slices/userSlice";

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user"], // Only persist these reducers
};

// Root reducer
const rootReducer = combineReducers({
  [baseSlice.reducerPath]: baseSlice.reducer,
  auth: authSlice,
  user: userSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(baseSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
