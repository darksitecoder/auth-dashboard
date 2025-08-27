import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load token from localStorage on initialization', () => {
      localStorageMock.getItem.mockReturnValue('stored-token');
      
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.token).toBe('stored-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should successfully login and update state', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        token: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          avatar: 'https://example.com/avatar.jpg'
        }
      };

      mockedAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(result.current.token).toBe('mock-token');
      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });

    it('should handle login error and update state', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = new Error('Invalid credentials');

      mockedAuthService.login.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login(credentials);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockedAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(credentials);
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        token: 'mock-token',
        user: { id: 1, email: 'test@example.com', first_name: 'John', last_name: 'Doe', avatar: '' }
      });

      await act(async () => {
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register and update state', async () => {
      const credentials = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      };
      const mockResponse = {
        token: 'mock-token',
        user: {
          id: 2,
          email: 'new@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          avatar: 'https://example.com/avatar2.jpg'
        }
      };

      mockedAuthService.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register(credentials);
      });

      expect(result.current.token).toBe('mock-token');
      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });

    it('should handle registration error and update state', async () => {
      const credentials = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      };
      const mockError = new Error('Email already exists');

      mockedAuthService.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register(credentials);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Email already exists');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all state and remove token from localStorage', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some initial state
      act(() => {
        result.current.token = 'some-token';
        result.current.user = { id: 1, email: 'test@example.com', first_name: 'John', last_name: 'Doe', avatar: '' };
        result.current.error = 'some error';
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set an error
      act(() => {
        result.current.error = 'some error';
      });

      expect(result.current.error).toBe('some error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when both token and user exist', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = 'some-token';
        result.current.user = { id: 1, email: 'test@example.com', first_name: 'John', last_name: 'Doe', avatar: '' };
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when token is missing', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = null;
        result.current.user = { id: 1, email: 'test@example.com', first_name: 'John', last_name: 'Doe', avatar: '' };
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false when user is missing', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = 'some-token';
        result.current.user = null;
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
