/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from './apiClient';
import { type Product } from '../types';
import { mapCategory } from './categoryService';
import { mapSupplier } from './supplierService';

export function mapProduct(p: any): Product {
  const categoryMapped = p.categorie ? mapCategory(p.categorie) : null;
  const supplierMapped = p.fournisseur ? mapSupplier(p.fournisseur) : null;

  return {
    id: Number(p.id),
    nom: p.nom || p.name || '',
    name: p.nom || p.name || '',
    description: p.description || '',
    prix: p.prix !== undefined ? Number(p.prix) : (p.unitPrice ? Number(p.unitPrice) : 0),
    unitPrice: p.prix !== undefined ? Number(p.prix) : (p.unitPrice ? Number(p.unitPrice) : 0),
    quantiteStock: p.quantiteStock !== undefined ? Number(p.quantiteStock) : (p.quantity ? Number(p.quantity) : 0),
    quantity: p.quantiteStock !== undefined ? Number(p.quantiteStock) : (p.quantity ? Number(p.quantity) : 0),
    dateAjout: p.dateAjout || p.createdAt || new Date().toISOString().substring(0, 10),
    createdAt: p.dateAjout || p.createdAt || new Date().toISOString(),
    categorie: categoryMapped || { id: 0, name: 'Unknown', nom: 'Unknown' } as any,
    category: categoryMapped || { id: 0, name: 'Unknown' } as any,
    fournisseur: supplierMapped || { id: 0, name: 'Unknown', nom: 'Unknown' } as any,
    supplier: supplierMapped || { id: 0, name: 'Unknown' } as any,
    categoryId: String(categoryMapped?.id || p.categoryId || ''),
    supplierId: String(supplierMapped?.id || p.supplierId || ''),
    minStockThreshold: p.minStockThreshold !== undefined ? Number(p.minStockThreshold) : 5,
  };
}

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/produits');
      return (response.data || []).map(mapProduct);
    } catch (error: any) {
      console.error('Error fetching products from backend:', error);
      throw error;
    }
  },

  async getById(id: string | number): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/produits/${id}`);
      return mapProduct(response.data);
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

 async create(data: any): Promise<Product> {
  try {
    const catId = Number(data.categoryId || data.category?.id || 1);
    const supId = Number(data.supplierId || data.supplier?.id || 1);
    
    const payload = {
      nom: data.nom || data.name || '',
      description: data.description || '',
      prix: Number(data.prix !== undefined ? data.prix : data.unitPrice || 0),
      quantiteStock: Number(data.quantiteStock !== undefined ? data.quantiteStock : data.quantity || 0),
      dateAjout: data.dateAjout || new Date().toISOString().substring(0, 10),
      categorie: { id: catId },
      fournisseur: { id: supId },
    };

    const response = await apiClient.post<any>('/produits', payload);
    return mapProduct(response.data);
  } catch (error: any) {
    console.error('Error creating product:', error);
    // Handle duplicate product name (HTTP 409 Conflict)
    if (error.response?.status === 409) {
      const message = error.response?.data || 'A product with this name already exists.';
      throw new Error(message);
    }
    throw error;
  }
},

  async update(id: string | number, data: any): Promise<Product> {
  try {
    const catId = Number(data.categoryId || data.category?.id || 1);
    const supId = Number(data.supplierId || data.supplier?.id || 1);

    const payload = {
      nom: data.nom || data.name || '',
      description: data.description || '',
      prix: Number(data.prix !== undefined ? data.prix : data.unitPrice || 0),
      quantiteStock: Number(data.quantiteStock !== undefined ? data.quantiteStock : data.quantity || 0),
      dateAjout: data.dateAjout || new Date().toISOString().substring(0, 10),
      categorie: { id: catId },
      fournisseur: { id: supId },
    };

    const response = await apiClient.put<any>(`/produits/${id}`, payload);
    return mapProduct(response.data);
  } catch (error: any) {
    console.error(`Error updating product ${id}:`, error);
    // Handle duplicate product name (HTTP 409 Conflict)
    if (error.response?.status === 409) {
      const message = error.response?.data || 'A product with this name already exists.';
      throw new Error(message);
    }
    throw error;
  }
},
  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/produits/${id}`);
    } catch (error: any) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
};
