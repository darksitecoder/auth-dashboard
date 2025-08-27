import { authService } from '../authService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockLoginResponse = { data: { token: 'mock-token' } };
      const mockUserResponse = { 
        data: { 
          data: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            avatar: 'https://example.com/avatar.jpg'
          }
        } 
      };

      mockedAxios.post.mockResolvedValueOnce(mockLoginResponse);
      mockedAxios.get.mockResolvedValueOnce(mockUserResponse);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://reqres.in/api/login',
        credentials
      );
      expect(mockedAxios.get).toHaveBeenCalledWith('https://reqres.in/api/users/1');
      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          avatar: 'https://example.com/avatar.jpg'
        }
      });
    });

    it('should throw error when login fails', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = {
        response: {
          data: { error: 'Invalid credentials' }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should throw generic error when no specific error message is provided', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockError = {};

      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should successfully register with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      };
      const mockRegisterResponse = { data: { token: 'mock-token' } };

      mockedAxios.post.mockResolvedValueOnce(mockRegisterResponse);

      // Act
      const result = await authService.register(credentials);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://reqres.in/api/register',
        {
          email: credentials.email,
          password: credentials.password
        }
      );
      expect(result.token).toBe('mock-token');
      expect(result.user).toEqual({
        id: expect.any(Number),
        email: credentials.email,
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        avatar: expect.stringMatching(/https:\/\/reqres\.in\/img\/faces\/\d+-image\.jpg/)
      });
    });

    it('should throw error when registration fails', async () => {
      // Arrange
      const credentials = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      };
      const mockError = {
        response: {
          data: { error: 'Email already exists' }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.register(credentials)).rejects.toThrow('Email already exists');
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully get current user with valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const mockUserResponse = {
        data: {
          data: {
            id: 1,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            avatar: 'https://example.com/avatar.jpg'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockUserResponse);

      // Act
      const result = await authService.getCurrentUser(token);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users/1',
        {
          headers: {
            Authorization: 'Bearer valid-token'
          }
        }
      );
      expect(result).toEqual(mockUserResponse.data.data);
    });

    it('should throw error when getting current user fails', async () => {
      // Arrange
      const token = 'invalid-token';
      const mockError = {};

      mockedAxios.get.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.getCurrentUser(token)).rejects.toThrow('Failed to get user data');
    });
  });
});
