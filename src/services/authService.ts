import axios from 'axios';
import { userService, mockUsers } from './userService';

// Mock API - no external API key required
const API_BASE_URL = '/api'; // This will be handled by our mock service

// Token to user mapping for session management
const tokenToUserMap = new Map<string, number>();

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

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
    isApproved: boolean;
    isAdmin: boolean;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      throw new Error('Your account is pending admin approval. Please wait for approval before logging in.');
    }
    
    // Generate a mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store token to user mapping
    tokenToUserMap.set(token, user.id);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        isApproved: user.isApproved,
        isAdmin: user.isAdmin
      }
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user (will be pending approval)
    const newUser = {
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      email: credentials.email,
      password: credentials.password,
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      avatar: `https://reqres.in/img/faces/${Math.floor(Math.random() * 12) + 1}-image.jpg`,
      isApproved: false,
      isAdmin: false,
      createdAt: new Date()
    };
    
    mockUsers.push(newUser);
    
    // Save to localStorage
    try {
      localStorage.setItem('auth_dashboard_users', JSON.stringify(mockUsers));
    } catch (error) {
      console.error('Failed to save new user to localStorage:', error);
    }
    
    // Generate a mock token (but user won't be able to access dashboard until approved)
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store token to user mapping
    tokenToUserMap.set(token, newUser.id);
    
    console.log('New user registered:', newUser);
    
    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        avatar: newUser.avatar,
        isApproved: newUser.isApproved,
        isAdmin: newUser.isAdmin
      }
    };
  }

  async getCurrentUser(token: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get user ID from token mapping
    const userId = tokenToUserMap.get(token);
    if (!userId) {
      throw new Error('Invalid token');
    }
    
    // Find user in mock database
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      isApproved: user.isApproved,
      isAdmin: user.isAdmin
    };
  }

  clearToken(token: string) {
    tokenToUserMap.delete(token);
  }
}

export const authService = new AuthService();