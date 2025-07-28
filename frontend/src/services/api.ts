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
    
    token = localStorage.getItem('access_token');
    
    if (!token) {
      try {
        const authStore = localStorage.getItem('auth-store');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          token = parsed?.state?.token || null;
        }
      } catch {}
    }
    
    if (!token) {
      token = sessionStorage.getItem('pingdaemon-token');
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear all authentication data on 401 errors
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-store');
      sessionStorage.removeItem('pingdaemon-token');
      sessionStorage.removeItem('pingdaemon-user');
      
      // Clear React Query cache to prevent data flashing
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        (window as any).queryClient.clear();
      }
      
      // Redirect to landing page for clean state
      window.location.href = '/';
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