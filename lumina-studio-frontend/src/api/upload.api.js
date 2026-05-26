/**
 * @file upload.api.js
 * @description Upload API for custom product images.
 * Uses multipart/form-data — bypasses the JSON Axios client.
 */
import { UPLOAD_URLS } from './ApiUrls';
import ENV from '../config/env';

/**
 * Upload a custom product image to the server.
 * @param {File} file - The image File object from the user's input
 * @returns {Promise<{ success: boolean, imageUrl: string }>}
 */
export const uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('lumina_auth_token');

    const response = await fetch(`${ENV.API_BASE_URL}${UPLOAD_URLS.UPLOAD_PRODUCT_IMAGE}`, {
        method: 'POST',
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Image upload failed.');
    }

    return response.json();
};
