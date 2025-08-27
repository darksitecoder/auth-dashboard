import { create } from 'zustand';
import { authService } from '../services/authService';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  isApproved: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: false, // Start as false until we verify the token
  isInitialized: false,

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        set({ isLoading: true });
        const user = await authService.getCurrentUser(token);
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        });
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.login(credentials);
      set({ 
        token: response.token, 
        user: response.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      
      localStorage.setItem('token', response.token);
      return response;
    } catch (err: any) {
      set({ 
        error: err.message || 'Login failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.register(credentials);
      set({ 
        token: response.token, 
        user: response.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      
      localStorage.setItem('token', response.token);
      return response;
    } catch (err: any) {
      set({ 
        error: err.message || 'Registration failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  logout: () => {
    const { token } = get();
    if (token) {
      authService.clearToken(token);
    }
    set({ 
      user: null, 
      token: null, 
      error: null, 
      isAuthenticated: false 
    });
    localStorage.removeItem('token');
  },

  clearError: () => {
    set({ error: null });
  },
}));
