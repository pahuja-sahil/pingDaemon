import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    setLoading,
  } = useAuthStore();

  // Check authentication status on mount, but not immediately after logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Only check auth if we might have a token (not during logout)
      const hasToken = localStorage.getItem('access_token') || 
                       sessionStorage.getItem('pingdaemon-token') ||
                       localStorage.getItem('auth-store');
      if (hasToken) {
        checkAuth();
      }
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  const handleLogin = async (credentials: LoginRequest, rememberMe?: boolean) => {
    await login(credentials, rememberMe);
  };

  const handleRegister = async (userData: RegisterRequest) => {
    await register(userData);
  };

  const handleLogout = () => {
    logout();
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    checkAuth,
    setLoading,
  };
};