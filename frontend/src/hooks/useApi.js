import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api`
        : (import.meta.env.PROD ? 'https://pvr-groups-1.onrender.com/api' : '/api'),
    timeout: 30000, // 30 second timeout
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pvr_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't clear token for /auth/me calls — AuthContext handles retries
            const url = error.config?.url || '';
            if (!url.includes('/auth/me')) {
                localStorage.removeItem('pvr_token');
                // Don't use window.location.href — let React Router handle redirect
                // This preserves browser history so back button works correctly
            }
        }
        return Promise.reject(error);
    }
);

export default api;