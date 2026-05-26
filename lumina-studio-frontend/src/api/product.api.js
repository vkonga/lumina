/**
 * @file product.api.js
 * @description Product / store API calls.
 * Consumed by productSlice thunks — never called directly from components.
 */
import client from './client';
import { PRODUCT_URLS } from './ApiUrls';

/**
 * Fetch products, optionally filtered by category.
 *
 * STATE MANAGEMENT: Store-level — dispatched via Redux thunk in productSlice.
 * @param {string} [category] - Filter category string. Omit for all products.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 *   data: { products: Product[], siteContent: object }
 */
export const fetchProducts = (category = '', options = {}) => {
    const params = category && category !== 'All Collections'
        ? { category }
        : {};
    return client.get(PRODUCT_URLS.GET_ALL, { params, signal: options.signal });
};
