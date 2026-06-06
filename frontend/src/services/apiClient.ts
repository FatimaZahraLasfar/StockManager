/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosError } from 'axios';

// Get base URL. Allow a default of localhost Spring Boot, but easily override.
export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 4000, // Reasonable timeout to trigger fallback early if offline
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockmanager_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch generic authorization errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear authenticated state on expired/invalid token
      localStorage.removeItem('stockmanager_token');
      localStorage.removeItem('stockmanager_active_user');
      // Redirect or let authService trigger update
    }
    return Promise.reject(error);
  }
);

/**
 * Checks whether we should fall back to client-side localStorage mock database.
 * We fall back if the backend REST request fails due to network error or timeout.
 */
export function isNetworkError(error: any): boolean {
  if (!error) return true;
  if (axios.isAxiosError(error)) {
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      !error.response
    );
  }
  return true;
}
