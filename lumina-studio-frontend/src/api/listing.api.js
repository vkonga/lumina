import client from './client';
import { LISTING_URLS } from './ApiUrls';

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's own services.
 * @returns {Promise<{ success, data, message, statusCode }>}
 */
export const getMyServices = () => client.get(LISTING_URLS.GET_MY_SERVICES);

/**
 * Create a new service for the authenticated user.
 * @param {{ title: string, img?: string, price?: number, reference_images?: string }} payload
 */
export const addMyService = (payload) => client.post(LISTING_URLS.ADD_SERVICE, payload);

/**
 * Delete one of the authenticated user's own services.
 * @param {number|string} id
 */
export const deleteMyService = (id) => client.delete(LISTING_URLS.DELETE_SERVICE(id));

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's own store products.
 * @returns {Promise<{ success, data, message, statusCode }>}
 */
export const getMyProducts = () => client.get(LISTING_URLS.GET_MY_PRODUCTS);

/**
 * Create a new store product for the authenticated user.
 * @param {{ title: string, price: number, description?: string, category?: string, image?: string, sizes?: Array<{size: string, price_modifier: number}> }} payload
 */
export const addMyProduct = (payload) => client.post(LISTING_URLS.ADD_PRODUCT, payload);

/**
 * Delete one of the authenticated user's own store products.
 * @param {number|string} id
 */
export const deleteMyProduct = (id) => client.delete(LISTING_URLS.DELETE_PRODUCT(id));
