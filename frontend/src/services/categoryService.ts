/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient';
import { type Category } from '../types';

export function mapCategory(c: any): Category {
  return {
    id: Number(c.id),
    nom: c.nom || c.name || '',
    name: c.nom || c.name || '',
    description: c.description || '',
    createdAt: c.createdAt || new Date().toISOString(),
    productCount: c.productCount || 0
  };
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return (response.data || []).map(mapCategory);
    } catch (error: any) {
      console.error('Error fetching categories from backend:', error);
      throw error;
    }
  },

  async getById(id: string | number): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return mapCategory(response.data);
    } catch (error: any) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  async create(data: any): Promise<Category> {
  try {
    const payload = { nom: data.nom || data.name || '', description: data.description || '' };
    const response = await apiClient.post('/categories', payload);
    return mapCategory(response.data);
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error(error.response?.data || 'A category with this name already exists.');
    }
    throw error;
  }
},

  async update(id: string | number, data: { name?: string; nom?: string; description?: string }): Promise<Category> {
  try {
    const payload = {
      nom: data.nom || data.name || '',
      description: data.description || '',
    };
    const response = await apiClient.put<Category>(`/categories/${id}`, payload);
    return mapCategory(response.data);
  } catch (error: any) {
    console.error(`Error updating category ${id}:`, error);
    if (error.response?.status === 409) {
      const message = error.response?.data || 'A category with this name already exists.';
      throw new Error(message);
    }
    throw error;
  }
},

  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error: any) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};
