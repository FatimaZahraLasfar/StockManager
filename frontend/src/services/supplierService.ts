
import { apiClient, isNetworkError } from './apiClient';
import { MockDb } from './mockDB';
import type { Supplier } from '../types';

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<Supplier[]>('/suppliers');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Fetching suppliers from local DB.');
        return MockDb.getSuppliers();
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Supplier> {
    try {
      const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const suppliers = MockDb.getSuppliers();
        const found = suppliers.find(s => s.id === id);
        if (!found) throw new Error(`Supplier with ID ${id} not found.`);
        return found;
      }
      throw error;
    }
  },

  async create(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    try {
      const response = await apiClient.post<Supplier>('/suppliers', data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const suppliers = MockDb.getSuppliers();
        const newSupplier: Supplier = {
          ...data,
          id: `sup_${Date.now()}`,
          createdAt: new Date().toISOString(),
          productCount: 0,
        };
        suppliers.push(newSupplier);
        MockDb.saveSuppliers(suppliers);
        return newSupplier;
      }
      throw error;
    }
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    try {
      const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const suppliers = MockDb.getSuppliers();
        const index = suppliers.findIndex(s => s.id === id);
        if (index === -1) throw new Error(`Supplier with ID ${id} not found.`);
        
        const updated: Supplier = {
          ...suppliers[index],
          ...data,
        };
        suppliers[index] = updated;
        MockDb.saveSuppliers(suppliers);
        return updated;
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/suppliers/${id}`);
    } catch (error) {
      if (isNetworkError(error)) {
        // Safe check if products are attached to this supplier
        const products = MockDb.getProducts();
        const hasProducts = products.some(p => p.supplierId === id);
        if (hasProducts) {
          throw new Error('Cannot delete supplier. It is currently associated with active inventory products.');
        }

        const suppliers = MockDb.getSuppliers();
        const filtered = suppliers.filter(s => s.id !== id);
        MockDb.saveSuppliers(filtered);
        return;
      }
      throw error;
    }
  }
};
