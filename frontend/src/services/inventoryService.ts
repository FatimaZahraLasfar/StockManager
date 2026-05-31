
import { apiClient, isNetworkError } from './apiClient';
import { MockDb } from './mockDB';
import type { StockMovement, DashboardStats } from '../types';

export interface CreateMovementDto {
  productId: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  date: string;
  notes?: string;
  userEmail: string;
  userName: string;
}

export const inventoryService = {
  async getMovements(): Promise<StockMovement[]> {
    try {
      const response = await apiClient.get<StockMovement[]>('/inventory/movements');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Fetching inventory movements from local DB.');
        return MockDb.getMovements();
      }
      throw error;
    }
  },

  async createMovement(data: CreateMovementDto): Promise<StockMovement> {
    try {
      const response = await apiClient.post<StockMovement>('/inventory/movements', data);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const products = MockDb.getProducts();
        const productIndex = products.findIndex(p => p.id === data.productId);
        
        if (productIndex === -1) {
          throw new Error('Selected product does not exist in the inventory database.');
        }

        const product = products[productIndex];
        
        // Quantities validations
        if (data.type === 'EXIT' && product.quantity < data.quantity) {
          throw new Error(`Insufficient stock. Current available quantity of '${product.name}' is only ${product.quantity} unit(s).`);
        }

        // Apply quantity modifications
        if (data.type === 'ENTRY') {
          product.quantity += data.quantity;
        } else {
          product.quantity -= data.quantity;
        }

        // Save updated product
        products[productIndex] = product;
        MockDb.saveProducts(products);

        // Add movement log
        const movements = MockDb.getMovements();
        const newMovement: StockMovement = {
          ...data,
          id: `mov_${Date.now()}`,
          productName: product.name,
        };

        movements.unshift(newMovement); // List new movements on top.
        MockDb.saveMovements(movements);

        return newMovement;
      }
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/inventory/dashboard-stats');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Backend server offline. Performing dashboard calculations locally from mock components db.');
        return MockDb.getDashboardStats();
      }
      throw error;
    }
  }
};
