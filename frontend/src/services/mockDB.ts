

import type { Product, Category, Supplier, StockMovement, User, DashboardStats } from '../types';

// Storage keys
const KEYS = {
  PRODUCTS: 'stockmanager_products',
  CATEGORIES: 'stockmanager_categories',
  SUPPLIERS: 'stockmanager_suppliers',
  MOVEMENTS: 'stockmanager_movements',
  USERS: 'stockmanager_users',
  ACTIVE_USER: 'stockmanager_active_user',
  TOKEN: 'stockmanager_token',
};

// Default static lists
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Electronics', description: 'Smartphones, laptops, monitors, accessories, and audio consumer gear.', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'cat_2', name: 'Office Supplies', description: 'Chairs, ergonomic desks, fine stationery, and equipment files.', createdAt: '2026-01-12T09:30:00Z' },
  { id: 'cat_3', name: 'Apparel', description: 'Promotional t-shirts, caps, branded polo shirts, and outerwear.', createdAt: '2026-01-15T10:15:00Z' },
  { id: 'cat_4', name: 'Hardware', description: 'Network patch cables, industrial toolkits, and heavy connectors.', createdAt: '2026-01-20T14:45:00Z' },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup_1', name: 'Apex Technologies', email: 'sales@apextech.com', phone: '+1 (555) 019-2831', address: '100 Silicon Blvd, San Jose, CA', createdAt: '2026-01-10T08:15:00Z' },
  { id: 'sup_2', name: 'Global Office Systems', email: 'orders@globaloffice.com', phone: '+1 (555) 043-9912', address: '450 Oak Avenue, Grand Rapids, MI', createdAt: '2026-01-12T09:40:00Z' },
  { id: 'sup_3', name: 'Vertex Supply Co.', email: 'logistics@vertexco.com', phone: '+1 (555) 012-7744', address: '88 Industry Ln, Chicago, IL', createdAt: '2026-01-20T11:20:00Z' },
  { id: 'sup_4', name: 'Aura Garments Ltd', email: 'info@auragarments.com', phone: '+33 1 42 27 78 90', address: '22 Rue de la Paix, Paris, France', createdAt: '2026-01-25T13:10:00Z' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Ultra Slim Laptop 15"',
    description: 'Core i7, 16GB RAM, 512GB SSD. Lightweight workhorse with pristine mechanical build.',
    categoryId: 'cat_1',
    supplierId: 'sup_1',
    quantity: 4,
    unitPrice: 1299.99,
    minStockThreshold: 10, // Under threshold: Low Stock!
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'prod_2',
    name: 'Pro Noise-Canceling Headphones',
    description: 'Active hybrid ANC, 40h battery life, premium spatial acoustics.',
    categoryId: 'cat_1',
    supplierId: 'sup_1',
    quantity: 0, // Out of Stock!
    unitPrice: 249.99,
    minStockThreshold: 5,
    createdAt: '2026-02-05T09:30:00Z'
  },
  {
    id: 'prod_3',
    name: 'Ergonomic Mesh Desk Chair',
    description: 'Fully adjustable lumbar support, 3D armrests, dynamic recline tension.',
    categoryId: 'cat_2',
    supplierId: 'sup_2',
    quantity: 18,
    unitPrice: 349.50,
    minStockThreshold: 5,
    createdAt: '2026-02-10T11:15:00Z'
  },
  {
    id: 'prod_4',
    name: '65W USB-C GaN Charger',
    description: 'Ultra compact 3-port wall charger for phone, tablet, and ultrabook.',
    categoryId: 'cat_1',
    supplierId: 'sup_1',
    quantity: 45,
    unitPrice: 39.99,
    minStockThreshold: 15,
    createdAt: '2026-02-15T14:20:00Z'
  },
  {
    id: 'prod_5',
    name: 'Heavy Duty Toolkit (82pc)',
    description: 'Professional grade chrome vanadium steel tools in rigid locking carry case.',
    categoryId: 'cat_4',
    supplierId: 'sup_3',
    quantity: 3, // Under threshold: Low Stock!
    unitPrice: 119.99,
    minStockThreshold: 5,
    createdAt: '2026-02-20T16:00:00Z'
  },
  {
    id: 'prod_6',
    name: 'A5 Premium Executive Journal',
    description: '120gsm dotted pages, lay-flat thread-bound vegan leather cover.',
    categoryId: 'cat_2',
    supplierId: 'sup_2',
    quantity: 135,
    unitPrice: 18.25,
    minStockThreshold: 20,
    createdAt: '2026-02-22T08:45:00Z'
  },
  {
    id: 'prod_7',
    name: 'Ultra-Durable HDMI 2.1 Cable (3m)',
    description: 'Braided nylon casing, 48Gbps bandwidth supporting 8K@60Hz resolution.',
    categoryId: 'cat_4',
    supplierId: 'sup_3',
    quantity: 150,
    unitPrice: 19.95,
    minStockThreshold: 30,
    createdAt: '2026-02-25T13:10:00Z'
  },
  {
    id: 'prod_8',
    name: 'Structured Polo Brand Shirt',
    description: '100% long-staple organic cotton, breathable pique knit, robust collar.',
    categoryId: 'cat_3',
    supplierId: 'sup_4',
    quantity: 210,
    unitPrice: 14.50,
    minStockThreshold: 45,
    createdAt: '2026-03-01T09:00:00Z'
  }
];

const DEFAULT_MOVEMENTS: StockMovement[] = [
  // Jan-May stock histories (2026)
  { id: 'mov_1', productId: 'prod_1', productName: 'Ultra Slim Laptop 15"', type: 'ENTRY', quantity: 20, date: '2026-02-01T10:05:00Z', notes: 'Initial inventory acquisition load', userEmail: 'admin@stockmanager.com', userName: 'Admin User' },
  { id: 'mov_2', productId: 'prod_1', productName: 'Ultra Slim Laptop 15"', type: 'EXIT', quantity: 10, date: '2026-02-15T11:40:00Z', notes: 'Corporate department dispatch', userEmail: 'manager@stockmanager.com', userName: 'Manager User' },
  { id: 'mov_3', productId: 'prod_1', productName: 'Ultra Slim Laptop 15"', type: 'EXIT', quantity: 6, date: '2026-03-10T16:15:00Z', notes: 'Online client sale fulfilment', userEmail: 'user@stockmanager.com', userName: 'Simple User' },
  { id: 'mov_4', productId: 'prod_2', productName: 'Pro Noise-Canceling Headphones', type: 'ENTRY', quantity: 15, date: '2026-02-05T09:35:00Z', notes: 'Receive new model supply batch', userEmail: 'manager@stockmanager.com', userName: 'Manager User' },
  { id: 'mov_5', productId: 'prod_2', productName: 'Pro Noise-Canceling Headphones', type: 'EXIT', quantity: 15, date: '2026-04-20T14:50:00Z', notes: 'Bulk educational organization sale', userEmail: 'user@stockmanager.com', userName: 'Simple User' }, // Now we have 0 remaining.
  { id: 'mov_6', productId: 'prod_3', productName: 'Ergonomic Mesh Desk Chair', type: 'ENTRY', quantity: 25, date: '2026-02-10T11:20:00Z', notes: 'Office depot import transfer', userEmail: 'manager@stockmanager.com', userName: 'Manager User' },
  { id: 'mov_7', productId: 'prod_3', productName: 'Ergonomic Mesh Desk Chair', type: 'EXIT', quantity: 7, date: '2026-05-18T10:30:00Z', notes: 'New design studio expansion fitout', userEmail: 'admin@stockmanager.com', userName: 'Admin User' },
  { id: 'mov_8', productId: 'prod_5', productName: 'Heavy Duty Toolkit (82pc)', type: 'ENTRY', quantity: 12, date: '2026-02-20T16:05:00Z', notes: 'Bulk tool intake', userEmail: 'manager@stockmanager.com', userName: 'Manager User' },
  { id: 'mov_9', productId: 'prod_5', productName: 'Heavy Duty Toolkit (82pc)', type: 'EXIT', quantity: 9, date: '2026-05-25T11:00:00Z', notes: 'Contractor supplies fleet supply', userEmail: 'user@stockmanager.com', userName: 'Simple User' },
];

export const MOCK_USERS: User[] = [
  { id: 'usr_1', name: 'Albert Admin', email: 'admin@stockmanager.com', role: 'Administrator', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr_2', name: 'Maria Manager', email: 'manager@stockmanager.com', role: 'Stock Manager', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr_3', name: 'Sam Simple', email: 'user@stockmanager.com', role: 'Simple User', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' }
];

export class MockDb {
  static getCategories(): Category[] {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  }

  static saveCategories(categories: Category[]) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static getSuppliers(): Supplier[] {
    const data = localStorage.getItem(KEYS.SUPPLIERS);
    if (!data) {
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
      return DEFAULT_SUPPLIERS;
    }
    return JSON.parse(data);
  }

  static saveSuppliers(suppliers: Supplier[]) {
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }

  static getProducts(): Product[] {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    const products: Product[] = data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    if (!data) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    
    // Resolve Categories and Suppliers reference objects
    const categories = this.getCategories();
    const suppliers = this.getSuppliers();
    
    return products.map(product => ({
      ...product,
      category: categories.find(cat => cat.id === product.categoryId),
      supplier: suppliers.find(sup => sup.id === product.supplierId),
    }));
  }

  static saveProducts(products: Product[]) {
    // Save only flat fields to avoid cyclic references or stale nested structures
    const cleanProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      minStockThreshold: p.minStockThreshold,
      createdAt: p.createdAt,
    }));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(cleanProducts));
  }

  static getMovements(): StockMovement[] {
    const data = localStorage.getItem(KEYS.MOVEMENTS);
    if (!data) {
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(DEFAULT_MOVEMENTS));
      return DEFAULT_MOVEMENTS;
    }
    return JSON.parse(data);
  }

  static saveMovements(movements: StockMovement[]) {
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
  }

  // Dashboard Stats calculation logic
  static getDashboardStats(): DashboardStats {
    const products = this.getProducts();
    const categories = this.getCategories();
    const suppliers = this.getSuppliers();
    const movements = this.getMovements();

    // 1. Calculations counts
    const lowStockCount = products.filter(p => p.quantity <= p.minStockThreshold && p.quantity > 0).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;

    // 2. Category Distributions
    const categoryDistributionMap: Record<string, number> = {};
    categories.forEach(c => {
      categoryDistributionMap[c.name] = 0;
    });
    products.forEach(p => {
      const catName = p.category?.name || 'Uncategorized';
      categoryDistributionMap[catName] = (categoryDistributionMap[catName] || 0) + p.quantity;
    });
    const categoryDistribution = Object.entries(categoryDistributionMap).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);

    // If empty distribution, fallback
    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: 'None', value: 0 });
    }

    // 3. Monthly Stock Movements (over last 4 calendar months)
    // Dynamic month calculation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const movementsByMonth: Record<string, { entries: number; exits: number }> = {};
    
    // Seed the last 4 months
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()] + ' ' + String(d.getFullYear()).substring(2);
      movementsByMonth[mName] = { entries: 0, exits: 0 };
    }

    movements.forEach(m => {
      try {
        const d = new Date(m.date);
        const mKey = monthNames[d.getMonth()] + ' ' + String(d.getFullYear()).substring(2);
        if (movementsByMonth[mKey]) {
          if (m.type === 'ENTRY') {
            movementsByMonth[mKey].entries += m.quantity;
          } else {
            movementsByMonth[mKey].exits += m.quantity;
          }
        }
      } catch (err) {
        // Safe check
      }
    });

    const monthlyMovements = Object.entries(movementsByMonth).map(([name, data]) => ({
      name,
      entries: data.entries,
      exits: data.exits,
    }));

    // 4. Products Added Per Month
    const addedMap: Record<string, number> = {};
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()] + ' ' + String(d.getFullYear()).substring(2);
      addedMap[mName] = 0;
    }

    products.forEach(p => {
      try {
        const d = new Date(p.createdAt);
        const mKey = monthNames[d.getMonth()] + ' ' + String(d.getFullYear()).substring(2);
        if (addedMap[mKey] !== undefined) {
          addedMap[mKey] += 1;
        }
      } catch(err) {}
    });

    const productsAddedByMonth = Object.entries(addedMap).map(([name, count]) => ({
      name,
      count
    }));

    // Refresh Category counts and Supplier counts in-memory to keep them consistent
    const updatedCategories = categories.map(c => ({
      ...c,
      productCount: products.filter(p => p.categoryId === c.id).length
    }));
    const updatedSuppliers = suppliers.map(s => ({
      ...s,
      productCount: products.filter(p => p.supplierId === s.id).length
    }));

    this.saveCategories(updatedCategories);
    this.saveSuppliers(updatedSuppliers);

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
      lowStockCount,
      outOfStockCount,
      categoryDistribution,
      monthlyMovements,
      productsAddedByMonth
    };
  }
}
