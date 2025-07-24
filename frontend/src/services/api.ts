import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;
    
    // Check multiple possible token locations
    // 1. Legacy localStorage location
    token = localStorage.getItem('access_token');
    
    // 2. Zustand persist store (Remember Me = true)
    if (!token) {
      try {
        const authStore = localStorage.getItem('auth-store');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          token = parsed?.state?.token || null;
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    // 3. Session storage (Remember Me = false)  
    if (!token) {
      token = sessionStorage.getItem('pingdaemon-token');
    }
    
    // List of endpoints that don't require authentication
    const publicEndpoints = ['/auth/register', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API Request with token:', { 
        url: config.url, 
        hasToken: !!token, 
        tokenStart: token.substring(0, 10) + '...' 
      });
    } else if (!isPublicEndpoint) {
      console.log('❌ API Request WITHOUT token:', { url: config.url });
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      // Clear all possible token storage locations
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-store');
      sessionStorage.removeItem('pingdaemon-token');
      sessionStorage.removeItem('pingdaemon-user');
      
      // Let manual logout handle navigation, don't redirect automatically
    }

    const errorMessage = getErrorMessage(error);
    return Promise.reject(new Error(errorMessage));
  }
);

function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as { detail?: string | Array<{ msg: string }>, message?: string };
    if (data.detail) {
      return Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
    }
    if (data.message) {
      return data.message;
    }
  }
  
  if (error.code === 'ECONNREFUSED') {
    return 'Unable to connect to the server. Please try again later.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred';
}

export default api;