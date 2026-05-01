import axios from 'axios';

// ── Determine base URL ────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : import.meta.env.PROD
        ? 'https://pvr-groups-1.onrender.com/api'
        : '/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Accept-Encoding': 'gzip, deflate, br' }, // Accept compressed responses
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pvr_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response interceptor: handle auth errors + rate-limit + retry ─────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;

        // 401 — clear token and redirect (except for /auth/me polling)
        if (response?.status === 401) {
            const url = config?.url || '';
            if (!url.includes('/auth/me')) {
                localStorage.removeItem('pvr_token');
            }
            return Promise.reject(error);
        }

        // 429 — Rate limited. Auto-retry after the Retry-After header value.
        if (response?.status === 429) {
            const retryAfter = parseInt(response.headers['retry-after'] || '15', 10);
            const retryMs = retryAfter * 1000;

            // Only retry once to avoid infinite loops
            if (!config._retried429) {
                config._retried429 = true;
                console.warn(`[API] Rate limited. Retrying after ${retryAfter}s…`);
                await new Promise((resolve) => setTimeout(resolve, retryMs));
                return api(config);
            }
            // On second 429, return a friendly error message
            return Promise.reject(new Error('You are sending too many requests. Please wait a moment and try again.'));
        }

        // 5xx — Retry once after 1 second for transient server errors
        if (response?.status >= 500 && !config._retried5xx) {
            config._retried5xx = true;
            console.warn(`[API] Server error ${response.status}. Retrying once…`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return api(config);
        }

        return Promise.reject(error);
    }
);

export default api;