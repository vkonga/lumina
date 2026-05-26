/**
 * @file cart.api.js
 * @description Shopping Cart API calls using the centralized Axios client.
 * Dispatched by cartSlice thunks — never called directly from components.
 */
import client from './client';
import { CART_URLS } from './ApiUrls';

/**
 * Fetch the authenticated user's shopping cart.
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 *   data: Array of cart items: [{ cart_item_id, quantity, product_id, title, price, category, description, image }]
 */
export const getCart = () => {
    return client.get(CART_URLS.GET_CART);
};

/**
 * Add a product to the user's shopping cart.
 * @param {{ productId: number, quantity: number }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const addToCart = (payload) => {
    return client.post(CART_URLS.ADD_ITEM, payload);
};

/**
 * Update the quantity of a product in the user's shopping cart.
 * @param {{ productId: number, quantity: number }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const updateCartItem = (payload) => {
    return client.put(CART_URLS.ADD_ITEM, payload);
};

/**
 * Remove a product from the user's shopping cart.
 * @param {number} productId
 * @param {string} selectedSize
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const removeFromCart = (productId, selectedSize = '') => {
    return client.delete(`${CART_URLS.REMOVE_ITEM(productId)}?selectedSize=${encodeURIComponent(selectedSize || '')}`);
};

/**
 * Clear the user's entire shopping cart.
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const clearCart = () => {
    return client.delete(CART_URLS.CLEAR_CART);
};
