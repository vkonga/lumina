/**
 * @file ResponseInterceptor.js
 * @description Axios response interceptor.
 *
 * - Normalizes ALL responses to: { success, message, data, errors, statusCode }
 * - Handles 401 Unauthorized → clears session, redirects to login
 * - Handles 403 Forbidden, 5xx server errors globally
 * - Handles network / timeout errors
 *
 * @param {import('axios').AxiosInstance} client
 */

/** Normalized success envelope */
const normalizeSuccess = (response) => ({
    success: true,
    message: response.data?.message || 'Request successful.',
    data: response.data?.data ?? response.data,
    errors: [],
    statusCode: response.status,
});

/** Normalized error envelope */
const normalizeError = (message, errors = [], statusCode = null) => ({
    success: false,
    message,
    data: null,
    errors,
    statusCode,
});

export const applyResponseInterceptor = (client) => {
    client.interceptors.response.use(
        // ── Success ──────────────────────────────────────────────────────────────
        (response) => normalizeSuccess(response),

        // ── Error ────────────────────────────────────────────────────────────────
        (error) => {
            if (error.response) {
                const { status, data } = error.response;

                // Session expired — clear token and trigger re-login
                if (status === 401) {
                    localStorage.removeItem('lumina_auth_token');
                    // Dispatch a custom event so AuthContext / Redux can react
                    window.dispatchEvent(new CustomEvent('lumina:session-expired'));
                }

                const message =
                    data?.message || data?.error || `Request failed with status ${status}`;
                const errors = data?.errors || [];

                return Promise.reject(normalizeError(message, errors, status));
            }

            // Network / timeout errors
            if (error.code === 'ECONNABORTED') {
                return Promise.reject(normalizeError('Request timed out. Please try again.', [], null));
            }

            // Cancelled request
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                return Promise.reject(normalizeError('Request was cancelled.', [], null));
            }

            return Promise.reject(
                normalizeError(error.message || 'A network error occurred.', [], null)
            );
        }
    );
};
