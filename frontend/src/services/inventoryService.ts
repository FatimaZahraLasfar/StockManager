
import { apiClient } from './apiClient';
import type {  StockMovement, DashboardStats, Product } from '../types';
import { mapProduct } from './productService';

export interface CreateMovementDto {
  productId: string | number;
  type: 'ENTRY' | 'EXIT' | 'ENTREE' | 'SORTIE';
  quantity: number;
  date?: string;
  notes?: string;
  userEmail?: string;
  userName?: string;
  userId?: number;
}

export function mapMovement(m: any): StockMovement {
  // Normalize the type
  let normalizedType = m.type;
  if (normalizedType === 'ENTREE') normalizedType = 'ENTRY';
  if (normalizedType === 'SORTIE') normalizedType = 'EXIT';
  
  const mappedProduct = m.produit ? mapProduct(m.produit) : {} as any;
  const u = m.user || {};

  return {
    id: Number(m.id),
    type: normalizedType,           // now 'ENTRY' or 'EXIT'
    quantite: m.quantite !== undefined ? Number(m.quantite) : (m.quantity ? Number(m.quantity) : 0),
    quantity: m.quantite !== undefined ? Number(m.quantite) : (m.quantity ? Number(m.quantity) : 0),
    dateMouvement: m.dateMouvement || m.date || new Date().toISOString(),
    date: m.dateMouvement || m.date || new Date().toISOString(),
    produit: mappedProduct,
    productId: String(mappedProduct.id || m.productId || ''),
    productName: mappedProduct.nom || mappedProduct.name || m.productName || '',
    user: {
      id: Number(u.id || 1),
      nom: u.nom || u.name || '',
      email: u.email || '',
      role: u.role || 'ROLE_USER',
      name: u.nom || u.name || '',
    },
    userEmail: u.email || m.userEmail || '',
    userName: u.nom || u.name || m.userName || '',
  };
}

export const inventoryService = {
  async getMovements(): Promise<StockMovement[]> {
    try {
      const response = await apiClient.get<any[]>('/mouvements');
      return (response.data || []).map(mapMovement);
    } catch (error: any) {
      console.error('Error fetching global movements:', error);
      throw error;
    }
  },

  async getMovementsByProduct(productId: string | number): Promise<StockMovement[]> {
    try {
      const response = await apiClient.get<any[]>(`/mouvements/produit/${productId}`);
      return (response.data || []).map(mapMovement);
    } catch (error: any) {
      console.error(`Error fetching movements for product ${productId}:`, error);
      throw error;
    }
  },

  async createMovement(data: CreateMovementDto): Promise<StockMovement> {
    try {
      // Find active user's ID to satisfy Spring Boot audit fields requirement
      let activeUserId = data.userId;
      if (!activeUserId) {
        const storedStr = localStorage.getItem('stockmanager_active_user');
        if (storedStr) {
          try {
            const activeUser = JSON.parse(storedStr);
            activeUserId = Number(activeUser.id);
          } catch {
            activeUserId = 1;
          }
        } else {
          activeUserId = 1;
        }
      }

      const pId = Number(data.productId);
      const qty = Number(data.quantity);

      const payload = {
        produitId: pId,
        quantite: qty,
        userId: activeUserId,
      };

      // Select correct backend endpoint: /api/mouvements/entree or /api/mouvements/sortie
      const normalizedType = String(data.type).toUpperCase();
      const isEntry = normalizedType === 'ENTRY' || normalizedType === 'ENTREE';
      const endpoint = isEntry ? '/mouvements/entree' : '/mouvements/sortie';

      const response = await apiClient.post<any>(endpoint, payload);
      return mapMovement(response.data);
    } catch (error: any) {
      console.error('Error recording stock movement:', error);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<any>('/dashboard/stats');
    const backendStats = response.data || {};
    
    // Load all products and movements
    let allProducts: Product[] = [];
    let allMovements: StockMovement[] = [];
    
    try {
      const productsResponse = await apiClient.get<any[]>('/produits');
      allProducts = (productsResponse.data || []).map(mapProduct);
    } catch (err) {
      console.error('Failed to load products for dashboard:', err);
    }

    try {
      const movementsResponse = await apiClient.get<any[]>('/mouvements');
      allMovements = (movementsResponse.data || []).map(mapMovement);
    } catch (err) {
      console.error('Failed to load movements for dashboard:', err);
    }

    // Category Distribution – from real products only
    let categoryDistribution: { name: string; value: number }[] = [];
    if (allProducts.length > 0) {
      const catMap: Record<string, number> = {};
      allProducts.forEach(p => {
        const catName = p.categorie?.nom || p.category?.name || 'Uncategorized';
        catMap[catName] = (catMap[catName] || 0) + p.quantity;
      });
      categoryDistribution = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    }

    // Monthly Movements – from real movements only
    let monthlyMovements: { name: string; entries: number; exits: number }[] = [];
    if (allMovements.length > 0) {
      const movementByDay: Record<string, { entries: number; exits: number }> = {};
      allMovements.forEach(m => {
        const dateObj = new Date(m.dateMouvement || m.date);
        const label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!movementByDay[label]) {
          movementByDay[label] = { entries: 0, exits: 0 };
        }
        const type = String(m.type).toUpperCase();
        if (type === 'ENTRY' || type === 'ENTREE') {
          movementByDay[label].entries += m.quantite || m.quantity;
        } else {
          movementByDay[label].exits += m.quantite || m.quantity;
        }
      });
      monthlyMovements = Object.entries(movementByDay)
        .map(([name, val]) => ({ name, entries: val.entries, exits: val.exits }))
        .reverse()
        .slice(0, 7);
    }

    // Products Added By Month – from real product creation dates only
    let productsAddedByMonth: { name: string; count: number }[] = [];
    if (allProducts.length > 0) {
      const addedMap: Record<string, number> = {};
      allProducts.forEach(p => {
        const date = new Date(p.dateAjout || p.createdAt || new Date());
        const monthName = date.toLocaleDateString(undefined, { month: 'short' });
        addedMap[monthName] = (addedMap[monthName] || 0) + 1;
      });
      productsAddedByMonth = Object.entries(addedMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          return months.indexOf(a.name) - months.indexOf(b.name);
        });
    }

    const outOfStockCount = allProducts.filter(p => p.quantity === 0).length;
    const lowStockCount = allProducts.filter(p => p.quantity > 0 && p.quantity <= (p.minStockThreshold || 5)).length;

    return {
      totalProducts: backendStats.totalProduits ?? allProducts.length,
      totalCategories: backendStats.totalCategories ?? 0,
      totalSuppliers: backendStats.totalFournisseurs ?? 0,
      lowStockCount,
      outOfStockCount,
      categoryDistribution,      // will be [] if no products
      monthlyMovements,          // will be [] if no movements
      productsAddedByMonth,      // will be [] if no products
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty stats, no mock data
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalSuppliers: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categoryDistribution: [],
      monthlyMovements: [],
      productsAddedByMonth: [],
    };
  }
}
};
