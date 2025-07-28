import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          
          // If rememberMe is false, store token in sessionStorage instead
          if (!rememberMe) {
            // Store in sessionStorage (clears on browser close)
            sessionStorage.setItem('pingdaemon-token', response.access_token);
            sessionStorage.setItem('pingdaemon-user', JSON.stringify(response.user));
            
            // Clear localStorage if it exists
            localStorage.removeItem('auth-store');
          }
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register(userData);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        // Clear session storage as well
        sessionStorage.removeItem('pingdaemon-token');
        sessionStorage.removeItem('pingdaemon-user');
        
        // Clear React Query cache to prevent data flashing
        if (typeof window !== 'undefined' && window.queryClient) {
          window.queryClient.clear();
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Check both localStorage (persist) and sessionStorage (remember me = false)
          let storedToken = authService.getToken();
          let storedUser = authService.getStoredUser();
          
          // If not in localStorage, check sessionStorage
          if (!storedToken) {
            storedToken = sessionStorage.getItem('pingdaemon-token');
            const userStr = sessionStorage.getItem('pingdaemon-user');
            storedUser = userStr ? JSON.parse(userStr) : null;
          }
          
          if (!storedToken || !storedUser) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Verify token is still valid by fetching current user
          const user = await authService.getCurrentUser();
          set({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Token is invalid, clear auth state
          authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);