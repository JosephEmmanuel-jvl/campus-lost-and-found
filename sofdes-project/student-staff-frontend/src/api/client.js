/**
 * src/api/client.js
 * ---------------------------------------------------------------------------
 * Centralized API client wrapper.
 * Automatically handles:
 *  - Prepends API_BASE_URL.
 *  - Attaches the JWT authorization header if present.
 *  - Handles errors, parses JSON, and logs out on 401 Unauthorized (expired token).
 * ---------------------------------------------------------------------------
 */

import { API_BASE_URL } from '../config';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !endpoint.includes('auth/login')) {
      // Token is invalid or expired, trigger auto-logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[API Client Error]', error);
    throw error;
  }
}

export const apiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  put(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },
  patch(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },
  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};
