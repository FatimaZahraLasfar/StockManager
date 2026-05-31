import { apiClient, isNetworkError } from './apiClient';
import { MockDb } from './mockDB';
import type { Product } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Fetching products from local DB.');
        return MockDb.getProducts();
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const products = MockDb.getProducts();
        const found = products.find(p => p.id === id);
        if (!found) throw new Error(`Product with ID ${id} not found.`);
        return found;
      }
      throw error;
    }
  },

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const response = await apiClient.post<Product>('/products', data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const products = MockDb.getProducts();
        const newProduct: Product = {
          ...data,
          id: `prod_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        products.push(newProduct);
        MockDb.saveProducts(products);
        return newProduct;
      }
      throw error;
    }
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const products = MockDb.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Product with ID ${id} not found.`);
        
        const updated: Product = {
          ...products[index],
          ...data,
        };
        products[index] = updated;
        MockDb.saveProducts(products);
        return updated;
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      if (isNetworkError(error)) {
        const products = MockDb.getProducts();
        const filtered = products.filter(p => p.id !== id);
        MockDb.saveProducts(filtered);
        return;
      }
      throw error;
    }
  }
};
