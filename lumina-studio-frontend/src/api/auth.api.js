/**
 * @file auth.api.js
 * @description Authentication API calls. All components access auth via Redux
 * thunks that call these functions — never directly from a component.
 */
import client from './client';
import { AUTH_URLS } from './ApiUrls';

/**
 * Sign in an existing user.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 *   data: { token: string, user: { id, username, email } }
 */
export const signIn = (payload) =>
    client.post(AUTH_URLS.SIGN_IN, payload);

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 *   data: { token: string, user: { id, username, email } }
 */
export const signUp = (payload) =>
    client.post(AUTH_URLS.SIGN_UP, payload);

/**
 * Fetch the authenticated user's profile.
 * Requires Authorization header (injected automatically by RequestInterceptor).
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const getMe = () =>
    client.get(AUTH_URLS.ME);

/**
 * Reset a user's password using their email address.
 * @param {{ email: string, newPassword: string }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const resetPassword = (payload) =>
    client.post(AUTH_URLS.FORGOT_PASSWORD, payload);
