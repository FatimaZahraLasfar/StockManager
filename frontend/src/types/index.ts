
export type UserRole = 'Administrator' | 'Stock Manager' | 'Simple User';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  productCount?: number;
}

export interface Product {
  // sku: string;
  id: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  minStockThreshold: number;
  category?: Category;     // Included when populated
  supplier?: Supplier;     // Included when populated
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  date: string;
  notes?: string;
  userEmail: string;
  userName: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryDistribution: { name: string; value: number }[];
  monthlyMovements: { name: string; entries: number; exits: number }[];
  productsAddedByMonth: { name: string; count: number }[];
}
