/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient';
import { type User, type UserRole } from '../types';

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ token: string; user: User }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      
      const token = response.data.token || response.data.accessToken || (response.data as any);
      if (!token || typeof token !== 'string') {
        throw new Error('No JWT token received from authentication endpoint.');
      }

      localStorage.setItem('stockmanager_token', token);

      let backendUser = response.data.user;
      
      // If user details not in payload, decode JWT claims for email and role
      const claims = parseJwt(token);
      
      const parsedRole = claims?.role || claims?.roles?.[0] || claims?.authorities?.[0] || 
        (email.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER');
      
      const parsedNom = claims?.nom || claims?.name || email.split('@')[0];
      const parsedId = claims?.id || 1;

      const user: User = {
        id: backendUser?.id ? Number(backendUser.id) : Number(parsedId),
        nom: backendUser?.nom || parsedNom,
        email: backendUser?.email || claims?.sub || claims?.email || email,
        role: (backendUser?.role || parsedRole) as UserRole,
        name: backendUser?.nom || parsedNom,
      };

      localStorage.setItem('stockmanager_active_user', JSON.stringify(user));
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Authentication failed. Please verify credentials.';
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
