/**
 * @file ApiUrls.js
 * @description Centralized registry of all backend API endpoint paths.
 * No component or Redux slice may contain raw URL strings — import from here.
 *
 * Paths are relative to the API base URL configured in src/config/env.js.
 */

/** Auth endpoints */
export const AUTH_URLS = {
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    SIGN_OUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
};

/** Home / landing page endpoints */
export const HOME_URLS = {
    GET_HOME_DATA: '/home',
};

/** Product / store endpoints */
export const PRODUCT_URLS = {
    GET_ALL: '/products',
    GET_BY_CATEGORY: '/products', // append ?category=<value>
    GET_BY_ID: (id) => `/products/${id}`,
};

/** Gallery endpoints */
export const GALLERY_URLS = {
    GET_GALLERY: '/gallery',
};

/** Cart endpoints */
export const CART_URLS = {
    GET_CART: '/cart',
    ADD_ITEM: '/cart',
    REMOVE_ITEM: (productId) => `/cart/${productId}`,
    CLEAR_CART: '/cart',
};

/** File upload endpoint */
export const UPLOAD_URLS = {
    UPLOAD_FILE: '/uploads',
    UPLOAD_PRODUCT_IMAGE: '/uploads/product-image',
};

/** Order endpoints */
export const ORDER_URLS = {
    CHECKOUT: '/orders/checkout',
    GET_MY_ORDERS: '/orders/my-orders',
};
