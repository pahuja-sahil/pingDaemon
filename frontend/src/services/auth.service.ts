import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

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
}

export const authService = new AuthService();
export default authService;