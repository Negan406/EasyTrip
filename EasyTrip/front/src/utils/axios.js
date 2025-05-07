import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle CSRF token mismatch errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            // Get new CSRF token
            await axios.get('http://localhost:8000/sanctum/csrf-cookie');
            // Retry the original request
            return axiosInstance(error.config);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 