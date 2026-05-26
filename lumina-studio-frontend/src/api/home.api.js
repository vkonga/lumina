/**
 * @file home.api.js
 * @description Home page API calls.
 * Consumed by homeSlice thunks — never called directly from components.
 */
import client from './client';
import { HOME_URLS } from './ApiUrls';

/**
 * Fetch all data needed to render the home page
 * (hero, services, gallery, testimonial, siteContent).
 *
 * STATE MANAGEMENT: Store-level — dispatched via Redux thunk in homeSlice.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const fetchHomeData = (options = {}) =>
    client.get(HOME_URLS.GET_HOME_DATA, { signal: options.signal });
