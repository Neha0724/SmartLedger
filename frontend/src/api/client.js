import { authEnabled } from '@/config/features';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === undefined
    ? true
    : import.meta.env.VITE_USE_MOCKS === 'true' || import.meta.env.VITE_USE_MOCKS === true;
// Helper to simulate network latency for mocks
export async function mockDelay(data, ms = 250) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return data;
}
export async function apiClient(endpoint, options = {}) {
    const token = localStorage.getItem('smartledger_token');
    const headers = new Headers(options.headers || {});
    // Only attach Authorization header if auth is enabled
    if (token && authEnabled) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (response.status === 401) {
            if (authEnabled) {
                localStorage.removeItem('smartledger_token');
                localStorage.removeItem('smartledger_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                throw new Error('Session expired. Please log in again.');
            }
            else {
                const errorJson = await response.json().catch(() => ({}));
                const err = {
                    message: errorJson.message || errorJson.detail || 'Unauthorized request (401)',
                    status: 401,
                    details: errorJson,
                };
                throw err;
            }
        }
        if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}));
            const err = {
                message: errorJson.message || `API request failed with status ${response.status}`,
                status: response.status,
                details: errorJson,
            };
            throw err;
        }
        return await response.json();
    }
    catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw {
                message: 'Cannot reach backend server. Please verify your connection or enable mock mode.',
                status: 0,
            };
        }
        throw error;
    }
}
