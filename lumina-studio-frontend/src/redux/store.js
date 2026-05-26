/**
 * @file store.js
 * @description Redux store — enterprise edition.
 * Replaces src/store/index.js.
 *
 * Slices registered here:
 *   auth     → authentication state (user, token, session)
 *   home     → home page data (hero, services, gallery, testimonial)
 *   products → store/product listing and siteContent
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import homeReducer from './slices/homeSlice';
import productReducer from './slices/productSlice';

const isDev = import.meta.env.MODE !== 'production';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        home: homeReducer,
        products: productReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for non-serializable token dates
                ignoredActions: ['auth/loginSuccess'],
            },
        }),
    devTools: isDev,
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
