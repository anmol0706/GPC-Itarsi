import axios from 'axios';
import config from '../config';

// Create an axios instance with the base URL from config
const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Axios interceptor: Setting Authorization header for ${config.url}`);
    } else {
      console.log(`Axios interceptor: No token found for ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Check for authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error detected:', error.response.data);
      // You could redirect to login page or show a notification here
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
