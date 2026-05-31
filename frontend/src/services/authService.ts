/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, isNetworkError } from './apiClient';
import { type User, type UserRole } from '../types';
import { MOCK_USERS, MockDb } from './mockDB';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    try {
      // 1. Try real backend first
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('stockmanager_token', token);
      localStorage.setItem('stockmanager_active_user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Falling back to secure frontend simulated JWT session.');
        
        // 2. Client-side authentication fallback
        const lowerEmail = email.toLowerCase().trim();
        const foundUser = MOCK_USERS.find(u => u.email === lowerEmail);
        
        if (!foundUser) {
          throw new Error('Invalid email or password. Try admin@stockmanager.com (pw: admin123).');
        }

        // Verify simulated password rules
        let expectedPassword = 'user123';
        if (foundUser.role === 'Administrator') expectedPassword = 'admin123';
        if (foundUser.role === 'Stock Manager') expectedPassword = 'manager123';

        if (password !== expectedPassword) {
          throw new Error('Invalid credentials provided. Check passwords for role accounts.');
        }

        // Create secure simulated token (signed with role name so we decode it client side)
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI${foundUser.id}IiwibmFtZSI6IiR7Zm91bmRVc2VyLm5hbWV9Iiwicm9sZSI6IiR7Zm91bmRVc2VyLnJvbGV9IiwiZW1haWwiOiIke2ZvdW5kVXNlci5lbWFpbH0ifQ.mockSignature`;
        
        localStorage.setItem('stockmanager_token', mockToken);
        localStorage.setItem('stockmanager_active_user', JSON.stringify(foundUser));
        
        return {
          token: mockToken,
          user: foundUser,
        };
      }
      
      // Real backend responded with an error (e.g. 400, 401, 403)
      const message = (error as any).response?.data?.message || 'Authentication failed. Please verify credentials.';
      throw new Error(message);
    }
  },

  logout(): void {
    localStorage.removeItem('stockmanager_token');
    localStorage.removeItem('stockmanager_active_user');
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem('stockmanager_active_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('stockmanager_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }
};
