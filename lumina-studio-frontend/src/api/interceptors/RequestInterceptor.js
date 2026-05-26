/**
 * @file RequestInterceptor.js
 * @description Axios request interceptor.
 * - Injects Authorization header from localStorage token.
 * - Attaches pagination query params if provided.
 * - Injects a unique request ID for traceability.
 *
 * @param {import('axios').AxiosInstance} client
 */
export const applyRequestInterceptor = (client) => {
    client.interceptors.request.use(
        (config) => {
            // Inject auth token
            const token = localStorage.getItem('lumina_auth_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            // Inject request trace ID
            config.headers['X-Request-ID'] = `lmn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

            return config;
        },
        (error) => Promise.reject(error)
    );
};
