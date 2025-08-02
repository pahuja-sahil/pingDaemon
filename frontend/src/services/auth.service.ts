import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    provider: string;
    is_active: boolean;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    await api.post<User>('/auth/register', userData);
    
    const loginResponse = await this.login({
      email: userData.email,
      password: userData.password,
    });

    return loginResponse;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-store');
    sessionStorage.removeItem('pingdaemon-token');
    sessionStorage.removeItem('pingdaemon-user');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return Boolean(token);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async verifyResetToken(token: string): Promise<boolean> {
    try {
      await api.post('/auth/verify-reset-token', null, {
        params: { token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      password
    });
  }

  async googleSignIn(googleToken: string): Promise<GoogleAuthResponse> {
    try {
      const response = await api.post<GoogleAuthResponse>('/auth/google', {
        google_token: googleToken
      });
      
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Google sign-in failed');
    }
  }

  async getGoogleLoginUrl(): Promise<string> {
    try {
      const response = await api.get('/auth/google/login');
      return response.data.auth_url;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get Google login URL');
    }
  }
}

export const authService = new AuthService();
export default authService;