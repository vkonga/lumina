/**
 * @file Utils.js
 * @description Centralized API utility layer for Lumina Studio.
 *
 * USAGE PATTERNS:
 *  - Component-local state: call these functions directly in the component
 *    and manage loading/error/data states locally (useState).
 *  - Shared/global state: dispatch Redux thunk actions that internally call
 *    these functions, then let slices manage the state in the Redux store.
 *
 * The functions in this file NEVER throw — all errors are caught and returned
 * as part of the normalized response shape: { data, error, status }.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Default retry count for all requests unless overridden. */
const DEFAULT_RETRY_COUNT = 1;

// ---------------------------------------------------------------------------
// Auth Token Helper
// ---------------------------------------------------------------------------

/**
 * Retrieves the auth token from localStorage.
 * Extend this to read from the Redux store if needed (e.g., via a store import).
 *
 * @returns {string|null} The stored auth token, or null if not present.
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('lumina_auth_token') || null;
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// Core Request (private)
// ---------------------------------------------------------------------------

/**
 * Internal helper that performs a fetch request with automatic auth headers,
 * AbortController support, and configurable retry logic.
 *
 * @param {string} method      - HTTP method: GET, POST, PUT, PATCH, DELETE.
 * @param {string} endpoint    - API path relative to BASE_URL (e.g. '/products').
 * @param {Object} [body]      - Request payload (serialized to JSON automatically).
 * @param {Object} [options]   - Additional options.
 * @param {AbortSignal} [options.signal]     - Signal from an AbortController.
 * @param {number}      [options.retries]    - Number of retry attempts (default: DEFAULT_RETRY_COUNT).
 * @param {Object}      [options.headers]    - Extra headers to merge.
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 */
const _request = async (method, endpoint, body = undefined, options = {}) => {
    const {
        signal,
        retries = DEFAULT_RETRY_COUNT,
        headers: extraHeaders = {},
    } = options;

    const url = `${BASE_URL}${endpoint}`;

    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
    };

    const fetchConfig = {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        ...(signal ? { signal } : {}),
    };

    let attempt = 0;

    while (attempt <= retries) {
        try {
            const response = await fetch(url, fetchConfig);
            let data = null;

            // Parse JSON only if there is a body in the response.
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMsg =
                    (typeof data === 'object' && data?.message) ||
                    `Request failed with status ${response.status}`;
                return { data: null, error: errorMsg, status: response.status };
            }

            return { data, error: null, status: response.status };
        } catch (err) {
            // Do not retry if the request was intentionally aborted.
            if (err.name === 'AbortError') {
                return { data: null, error: 'Request was cancelled.', status: null };
            }

            attempt += 1;
            if (attempt > retries) {
                return {
                    data: null,
                    error: err.message || 'Network error. Please try again.',
                    status: null,
                };
            }

            // Exponential back-off: 300ms, 600ms, ...
            await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        }
    }
};

// ---------------------------------------------------------------------------
// Public HTTP Verb Helpers
// ---------------------------------------------------------------------------

/**
 * Performs a GET request.
 *
 * STATE MANAGEMENT:
 *  - Component-level: use directly inside a component with useState for data, loading, error.
 *  - Store-level: call inside a Redux createAsyncThunk to share result across components.
 *
 * @param {string} endpoint           - API path, e.g. '/products'.
 * @param {Object} [params]           - Query parameters as a plain object.
 * @param {Object} [options]          - Additional options (signal, retries, headers).
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 *
 * @example
 * // Component-level
 * const { data, error } = await getRequest('/products', { category: 'Frames' });
 *
 * // Store-level (inside createAsyncThunk)
 * const { data } = await getRequest('/products');
 * if (!data) throw new Error(error);
 * return data;
 */
export const getRequest = async (endpoint, params = {}, options = {}) => {
    let path = endpoint;
    const queryString = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (queryString) {
        path = `${endpoint}?${queryString}`;
    }
    return _request('GET', path, undefined, options);
};

/**
 * Performs a POST request.
 *
 * STATE MANAGEMENT:
 *  - Component-level: use for form submissions or one-off mutations local to a component.
 *  - Store-level: use inside a thunk to update shared authentication/cart state.
 *
 * @param {string} endpoint   - API path, e.g. '/auth/login'.
 * @param {Object} [payload]  - Request body.
 * @param {Object} [options]  - Additional options (signal, retries, headers).
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 */
export const postRequest = async (endpoint, payload = {}, options = {}) =>
    _request('POST', endpoint, payload, options);

/**
 * Performs a PATCH request (partial update).
 *
 * STATE MANAGEMENT:
 *  - Component-level: use for in-place edits scoped to a single component.
 *  - Store-level: use inside a thunk when the patched entity is shared state.
 *
 * @param {string} endpoint   - API path, e.g. '/products/42'.
 * @param {Object} [payload]  - Partial fields to update.
 * @param {Object} [options]  - Additional options (signal, retries, headers).
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 */
export const patchRequest = async (endpoint, payload = {}, options = {}) =>
    _request('PATCH', endpoint, payload, options);

/**
 * Performs a PUT request (full replacement).
 *
 * STATE MANAGEMENT:
 *  - Component-level: use for full-replace mutations local to a single form/view.
 *  - Store-level: use inside a thunk when the resource is shared across components.
 *
 * @param {string} endpoint   - API path, e.g. '/products/42'.
 * @param {Object} [payload]  - Full replacement body.
 * @param {Object} [options]  - Additional options (signal, retries, headers).
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 */
export const putRequest = async (endpoint, payload = {}, options = {}) =>
    _request('PUT', endpoint, payload, options);

/**
 * Performs a DELETE request.
 *
 * STATE MANAGEMENT:
 *  - Component-level: use when deletion result does not affect global state.
 *  - Store-level: use inside a thunk to sync the removed item out of shared state.
 *
 * @param {string} endpoint   - API path, e.g. '/products/42'.
 * @param {Object} [options]  - Additional options (signal, retries, headers).
 * @returns {Promise<{data: any, error: string|null, status: number|null}>}
 */
export const deleteRequest = async (endpoint, options = {}) =>
    _request('DELETE', endpoint, undefined, options);

// ---------------------------------------------------------------------------
// AbortController Factory Helper
// ---------------------------------------------------------------------------

/**
 * Creates a new AbortController and returns both the controller and its signal.
 * Pass `signal` into any request option to support cancellation.
 *
 * @returns {{ controller: AbortController, signal: AbortSignal }}
 *
 * @example
 * const { controller, signal } = createAbortController();
 * getRequest('/home', {}, { signal });
 * // Later, to cancel:
 * controller.abort();
 */
export const createAbortController = () => {
    const controller = new AbortController();
    return { controller, signal: controller.signal };
};
