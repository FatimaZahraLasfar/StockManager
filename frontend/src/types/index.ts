export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string | Number;
  nom: string;
  email: string;
  role: UserRole;
  name: string; // fallback mapping
  avatarUrl?: string;
}

export interface Category {
  id: string | number;
  nom: string;
  description?: string;
  createdAt?: string;
  productCount?: number;
  // compatibility mappings:
  name: string;
}

export interface Supplier {
  id: string | number;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  createdAt?: string;
  productCount?: number;
  // compatibility mappings:
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string | Number ;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  dateAjout: string;
  categorie: Category;
  fournisseur: Supplier;
  minStockThreshold: number;

  // compatibility mappings:
  name: string;
  quantity: number;
  unitPrice: number;
  categoryId: string;
  supplierId: string;
  category?: Category;
  supplier?: Supplier;
  createdAt?: string;
}

export interface StockMovement {
  id: string | Number;
  type: string; // 'ENTRY' | 'EXIT' / 'ENTREE' | 'SORTIE'
  quantite: number;
  dateMouvement: string;
  produit: Product;
  user: User;

  // compatibility mappings:
  productId: string;
  productName: string;
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
