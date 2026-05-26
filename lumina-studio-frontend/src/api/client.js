/**
 * @file client.js
 * @description Configured Axios instance — the single HTTP transport used by
 * ALL feature API files. Never import axios directly elsewhere.
 *
 * Interceptors are applied in:
 *   - RequestInterceptor.js  → token injection, pagination headers
 *   - ResponseInterceptor.js → response normalization, 401 handling, errors
 */
import axios from 'axios';
import ENV from '../config/env';
import { applyRequestInterceptor } from './interceptors/RequestInterceptor';
import { applyResponseInterceptor } from './interceptors/ResponseInterceptor';

const apiClient = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: ENV.TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Attach interceptors
applyRequestInterceptor(apiClient);
applyResponseInterceptor(apiClient);

export default apiClient;
