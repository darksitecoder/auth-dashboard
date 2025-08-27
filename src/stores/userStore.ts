import { create } from 'zustand';
import { userService, User, PendingUser } from '../services/userService';

interface UserState {
  users: User[];
  pendingUsers: PendingUser[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchUsers: (page?: number) => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  approveUser: (id: number) => Promise<void>;
  rejectUser: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  pendingUsers: [],
  currentUser: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  fetchUsers: async (page: number = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userService.getUsers(page);
      set({ 
        users: response.data, 
        totalPages: response.total_pages,
        currentPage: page,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch users', 
        isLoading: false 
      });
    }
  },

  fetchPendingUsers: async () => {
    try {
      set({ isLoading: true, error: null });
      const pendingUsers = await userService.getPendingUsers();
      set({ 
        pendingUsers,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch pending users', 
        isLoading: false 
      });
    }
  },

  fetchUserById: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const user = await userService.getUserById(id);
      set({ currentUser: user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch user', 
        isLoading: false 
      });
    }
  },

  createUser: async (userData: Omit<User, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      await userService.createUser(userData);
      // Refresh the users list
      await get().fetchUsers(get().currentPage);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create user', 
        isLoading: false 
      });
    }
  },

  updateUser: async (id: number, userData: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });
      await userService.updateUser(id, userData);
      // Refresh the users list
      await get().fetchUsers(get().currentPage);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update user', 
        isLoading: false 
      });
    }
  },

  deleteUser: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await userService.deleteUser(id);
      // Refresh the users list
      await get().fetchUsers(get().currentPage);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete user', 
        isLoading: false 
      });
    }
  },

  approveUser: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await userService.approveUser(id);
      // Refresh both users and pending users lists
      await Promise.all([
        get().fetchUsers(get().currentPage),
        get().fetchPendingUsers()
      ]);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to approve user', 
        isLoading: false 
      });
    }
  },

  rejectUser: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await userService.rejectUser(id);
      // Refresh both users and pending users lists
      await Promise.all([
        get().fetchUsers(get().currentPage),
        get().fetchPendingUsers()
      ]);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to reject user', 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
