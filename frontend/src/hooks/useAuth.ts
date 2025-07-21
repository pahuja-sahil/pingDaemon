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

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  const handleLogin = async (credentials: LoginRequest) => {
    await login(credentials);
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