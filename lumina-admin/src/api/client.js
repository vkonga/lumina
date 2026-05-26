import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request Interceptor to inject bearer token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lumina_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to flatten data and capture errors
client.interceptors.response.use(
  (response) => {
    return {
      success: true,
      data: response.data,
      statusCode: response.status
    };
  },
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'A network error occurred.';
    return {
      success: false,
      message,
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null
    };
  }
);

export default client;
