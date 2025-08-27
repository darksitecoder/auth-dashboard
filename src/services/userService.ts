// Define the full user interface for mock data
interface MockUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  avatar: string;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

// Local storage keys
const USERS_STORAGE_KEY = 'auth_dashboard_users';

// Helper functions for localStorage
const saveUsersToStorage = (users: MockUser[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
};

const loadUsersFromStorage = (): MockUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      // Convert string dates back to Date objects
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
    }
  } catch (error) {
    console.error('Failed to load users from localStorage:', error);
  }
  return [];
};

// Initialize mock users with localStorage persistence
const getInitialUsers = (): MockUser[] => {
  const storedUsers = loadUsersFromStorage();
  
  if (storedUsers.length > 0) {
    return storedUsers;
  }
  
  // Default users if no stored data exists
  const defaultUsers: MockUser[] = [
    {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      avatar: 'https://reqres.in/img/faces/1-image.jpg',
      isApproved: true,
      isAdmin: false,
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      email: 'admin@example.com',
      password: 'admin123',
      first_name: 'Jane',
      last_name: 'Smith',
      avatar: 'https://reqres.in/img/faces/2-image.jpg',
      isApproved: true,
      isAdmin: true,
      createdAt: new Date('2024-01-01')
    }
  ];
  
  // Save default users to localStorage
  saveUsersToStorage(defaultUsers);
  return defaultUsers;
};

// Shared mock user database - accessible by both auth and user services
export const mockUsers: MockUser[] = getInitialUsers();

// Function to save current state to localStorage
const saveCurrentState = () => {
  saveUsersToStorage(mockUsers);
};

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  isApproved?: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
}

export interface UsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

export interface PendingUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  avatar: string;
  createdAt: Date;
}

class UserService {
  async getUsers(page: number = 1, perPage: number = 6): Promise<UsersResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const approvedUsers = mockUsers.filter(user => user.isApproved);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedUsers = approvedUsers.slice(startIndex, endIndex);
    
    return {
      page,
      per_page: perPage,
      total: approvedUsers.length,
      total_pages: Math.ceil(approvedUsers.length / perPage),
      data: paginatedUsers.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar
      }))
    };
  }

  async getUserById(id: number): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar
    };
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newId = Math.max(...mockUsers.map(u => u.id)) + 1;
    const newUser: MockUser = {
      id: newId,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      avatar: userData.avatar,
      password: '', // We don't store passwords in user creation from dashboard
      isApproved: true, // Admin-created users are auto-approved
      isAdmin: false,
      createdAt: new Date()
    };
    
    mockUsers.push(newUser);
    saveCurrentState(); // Save to localStorage
    console.log('New user created by admin:', newUser);
    
    return {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      avatar: newUser.avatar
    };
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    saveCurrentState(); // Save to localStorage
    
    return {
      id: mockUsers[userIndex].id,
      email: mockUsers[userIndex].email,
      first_name: mockUsers[userIndex].first_name,
      last_name: mockUsers[userIndex].last_name,
      avatar: mockUsers[userIndex].avatar
    };
  }

  async deleteUser(id: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers.splice(userIndex, 1);
    saveCurrentState(); // Save to localStorage
  }

  // Admin approval methods
  async getPendingUsers(): Promise<PendingUser[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const pendingUsers = mockUsers
      .filter(user => !user.isApproved)
      .map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        avatar: user.avatar,
        createdAt: user.createdAt
      }));
    
    console.log('Pending users:', pendingUsers);
    console.log('All users:', mockUsers);
    
    return pendingUsers;
  }

  async approveUser(id: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.isApproved = true;
    saveCurrentState(); // Save to localStorage
    console.log(`User ${user.email} approved successfully`);
  }

  async rejectUser(id: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const user = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);
    saveCurrentState(); // Save to localStorage
    console.log(`User ${user.email} rejected and removed`);
  }

  // Check if user is approved
  async checkUserApproval(email: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.email === email);
    return user ? user.isApproved : false;
  }

  // Check if user is admin
  async checkUserAdmin(email: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.email === email);
    return user ? user.isAdmin : false;
  }

  // Utility methods for data management
  static clearAllData(): void {
    try {
      localStorage.removeItem(USERS_STORAGE_KEY);
      console.log('All user data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  static getStoredUserCount(): number {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        return users.length;
      }
    } catch (error) {
      console.error('Failed to get stored user count:', error);
    }
    return 0;
  }

  static exportUserData(): string {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored || '[]';
    } catch (error) {
      console.error('Failed to export user data:', error);
      return '[]';
    }
  }
}

export const userService = new UserService();