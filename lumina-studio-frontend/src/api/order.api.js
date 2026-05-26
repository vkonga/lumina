import client from './client';
import { ORDER_URLS } from './ApiUrls';

/**
 * Place a new order with cart contents
 * @param {{ delivery_name, delivery_phone, delivery_address, delivery_city, delivery_state, delivery_pincode, payment_method, notes }} payload
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const checkout = (payload) => {
    return client.post(ORDER_URLS.CHECKOUT, payload);
};

/**
 * Fetch current user's order history
 * @returns {Promise<{ success, message, data, errors, statusCode }>}
 */
export const getMyOrders = () => {
    return client.get(ORDER_URLS.GET_MY_ORDERS);
};
