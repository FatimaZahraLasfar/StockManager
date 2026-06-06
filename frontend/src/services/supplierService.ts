/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient';
import {type Supplier } from '../types';

export function mapSupplier(s: any): Supplier {
  return {
    id: Number(s.id),
    nom: s.nom || s.name || '',
    name: s.nom || s.name || '',
    telephone: s.telephone || s.phone || '',
    phone: s.telephone || s.phone || '',
    email: s.email || '',
    adresse: s.adresse || s.address || '',
    address: s.adresse || s.address || '',
    createdAt: s.createdAt || new Date().toISOString(),
    productCount: s.productCount || 0
  };
}

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<Supplier[]>('/fournisseurs');
      return (response.data || []).map(mapSupplier);
    } catch (error: any) {
      console.error('Error fetching suppliers from backend:', error);
      throw error;
    }
  },

  async getById(id: string | number): Promise<Supplier> {
    try {
      const response = await apiClient.get<Supplier>(`/fournisseurs/${id}`);
      return mapSupplier(response.data);
    } catch (error: any) {
      console.error(`Error fetching supplier with ID ${id}:`, error);
      throw error;
    }
  },

  async create(data: any): Promise<Supplier> {
  try {
    const payload = {
      nom: data.nom || data.name || '',
      telephone: data.telephone || data.phone || '',
      email: data.email || '',
      adresse: data.adresse || data.address || '',
    };
    const response = await apiClient.post('/fournisseurs', payload);
    return mapSupplier(response.data);
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error(error.response?.data || 'A supplier with this name already exists.');
    }
    throw error;
  }
},

  async update(id: string | number, data: { name?: string; nom?: string; phone?: string; telephone?: string; email?: string; address?: string; adresse?: string }): Promise<Supplier> {
  try {
    const payload = {
      nom: data.nom || data.name || '',
      telephone: data.telephone || data.phone || '',
      email: data.email || '',
      adresse: data.adresse || data.address || '',
    };
    const response = await apiClient.put<Supplier>(`/fournisseurs/${id}`, payload);
    return mapSupplier(response.data);
  } catch (error: any) {
    console.error(`Error updating supplier ${id}:`, error);
    if (error.response?.status === 409) {
      const message = error.response?.data || 'A supplier with this name already exists.';
      throw new Error(message);
    }
    throw error;
  }
},
  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/fournisseurs/${id}`);
    } catch (error: any) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }
};
