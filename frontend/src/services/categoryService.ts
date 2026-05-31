
import { apiClient, isNetworkError } from './apiClient';
import { MockDb } from './mockDB';
import type { Category } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Fetching categories from local DB.');
        return MockDb.getCategories();
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const categories = MockDb.getCategories();
        const found = categories.find(c => c.id === id);
        if (!found) throw new Error(`Category with ID ${id} not found.`);
        return found;
      }
      throw error;
    }
  },

  async create(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    try {
      const response = await apiClient.post<Category>('/categories', data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const categories = MockDb.getCategories();
        const newCategory: Category = {
          ...data,
          id: `cat_${Date.now()}`,
          createdAt: new Date().toISOString(),
          productCount: 0,
        };
        categories.push(newCategory);
        MockDb.saveCategories(categories);
        return newCategory;
      }
      throw error;
    }
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const response = await apiClient.put<Category>(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const categories = MockDb.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) throw new Error(`Category with ID ${id} not found.`);
        
        const updated: Category = {
          ...categories[index],
          ...data,
        };
        categories[index] = updated;
        MockDb.saveCategories(categories);
        return updated;
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      if (isNetworkError(error)) {
        // Safe check if products are attached to this category before deleting
        const products = MockDb.getProducts();
        const hasProducts = products.some(p => p.categoryId === id);
        if (hasProducts) {
          throw new Error('Cannot delete category. It is linked to one or more active inventory products.');
        }

        const categories = MockDb.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        MockDb.saveCategories(filtered);
        return;
      }
      throw error;
    }
  }
};
