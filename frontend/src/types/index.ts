export type UseRole = 'Administrator' | 'Stock Manager' | 'Simple User';

//User Interface
export interface User{
    id : string;
    name: string;
    email: string;
    role: UseRole;
    avatarUrl? : string;
}

//Catgeory Interface
export interface Catgeory {
    id : string;
    name : string;
    description : string;
    createdAt : string;
    productCount? : number;
}

//Supplier Interface
export interface Supplier{
    id : string;
    name : string;
    email : string;
    phone : string;
    address : string;
    createdAt : string;
    productCount? : number;
}

//Product Interface
export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  minStockThreshold: number;
  category? : Catgeory;      // Included when populated
  supplier? : Supplier;     // Included when populated
}

//StockMovement Interface
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

// DashboardStats Interface
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
