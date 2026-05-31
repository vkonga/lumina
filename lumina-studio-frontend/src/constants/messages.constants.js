/**
 * @file messages.constants.js
 * @description User-facing loading, error, and success message strings.
 */

/** @type {Object.<string, string>} */
export const LOADING_MESSAGES = {
    HOME: 'Loading Elite Experience...',
    STORE: 'Loading Boutique Collection...',
    GENERIC: 'Loading Experience...',
};

/** @type {Object.<string, string>} */
export const ERROR_MESSAGES = {
    LOAD_HOME_FAILED: 'Failed to load content. Please refresh the page.',
    LOAD_PRODUCTS_FAILED: 'Failed to load boutique collection. Please try again.',
    LOGIN_FAILED: 'Invalid email or password. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    GENERIC: 'Something went wrong. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
};

/** @type {Object.<string, string>} */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Welcome back to SD Photography.',
    NEWSLETTER_SUBSCRIBED: 'You have joined the circle. Welcome.',
    BOOKING_CONFIRMED: 'Your booking has been confirmed.',
    PROFILE_UPDATED: 'Your profile has been updated successfully.',
    PASSWORD_RESET_SENT: 'A password reset link has been sent to your email.',
};
