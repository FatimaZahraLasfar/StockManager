import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { Product, Category, Supplier } from '../types';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  AlertTriangle,
  Loader2,
  PackageCheck,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

export const Products: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  // Core records lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Search, Sort, Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState(''); // 'ALL', 'LOW', 'OUT'
  const [sortBy, setSortBy] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // CRUD Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // holds id of product being deleted

  // Role Checks
  const canModify = hasRole(['Administrator', 'Stock Manager']);

  // React Hook Form for Product Creation/Updates
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      quantity: 0,
      unitPrice: 0.0,
      minStockThreshold: 5,
    }
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prodList = await productService.getAll();
      const catList = await categoryService.getAll();
      const supList = await supplierService.getAll();

      setProducts(prodList);
      setCategories(catList);
      setSuppliers(supList);
    } catch (err: any) {
      showError('Failed to sync catalog inventory catalogs lists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Opening create draft
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      quantity: 0,
      unitPrice: 0.0,
      minStockThreshold: 5,
    });
    setIsModalOpen(true);
  };

  // Handle Opening update layout draft
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      minStockThreshold: product.minStockThreshold,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Cast numerical inputs explicitly
      const payload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        minStockThreshold: Number(data.minStockThreshold),
      };

      if (editingProduct) {
        const updated = await productService.update(editingProduct.id, payload);
        showSuccess(`Product "${updated.name}" successfully updated in records database.`);
      } else {
        const created = await productService.create(payload);
        showSuccess(`New product "${created.name}" successfully registered in database.`);
      }
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to submit product sheet information.');
    }
  };

  // Handle Delete operation
  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      await productService.delete(id);
      showSuccess(`Product "${name}" dropped from active database records.`);
      setIsDeleting(null);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to purge database metadata for product.');
    }
  };

  // Sorting Handler
  const handleSort = (field: keyof Product) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Advanced filtration and search query compilation
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.category?.name || '').toLowerCase().includes(query) ||
      (product.supplier?.name || '').toLowerCase().includes(query);

    // 2. Category Dropdown Filter
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

    // 3. Supplier Dropdown Filter
    const matchesSupplier = !supplierFilter || product.supplierId === supplierFilter;

    // 4. Low alerts or out limits filter
    let matchesStatus = true;
    if (stockStatusFilter === 'OUT') {
      matchesStatus = product.quantity === 0;
    } else if (stockStatusFilter === 'LOW') {
      matchesStatus = product.quantity <= product.minStockThreshold && product.quantity > 0;
    } else if (stockStatusFilter === 'OK') {
      matchesStatus = product.quantity > product.minStockThreshold;
    }

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let rawA = a[sortBy];
    let rawB = b[sortBy];

    // Safe lowercase compare
    if (typeof rawA === 'string' && typeof rawB === 'string') {
      rawA = rawA.toLowerCase();
      rawB = rawB.toLowerCase();
    }

    if (rawA < rawB) return sortDirection === 'asc' ? -1 : 1;
    if (rawA > rawB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate Pagination splits
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 text-blue-600 animate-spin" />
        <span className="text-xs font-mono text-gray-400">Loading catalog indexes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-gray-900">Total Catalog Products</h1>
          <p className="text-xs text-gray-500 mt-1">Manage unique product entries, edit specifications, and audit stock ratios.</p>
        </div>
        
        {/* Protected ADD Button */}
        {canModify ? (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all ml-auto sm:ml-0"
            id="btn_add_product"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Product</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-400 font-mono flex items-center gap-1.5 leading-none">
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span>Read-Only Accounts Area</span>
          </div>
        )}
      </div>

      {/* 2. Search & Search Filter Form Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <h4 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">Search Filters & Controls</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main search text field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search product metadata..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium"
              id="search_products"
            />
          </div>

          {/* Category Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 font-medium cursor-pointer"
            id="filter_category"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Supplier Selector */}
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 font-medium cursor-pointer"
            id="filter_supplier"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(sup => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>

          {/* Stock Metrics State Dropdown */}
          <select
            value={stockStatusFilter}
            onChange={(e) => {
              setStockStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 font-medium cursor-pointer"
            id="filter_status"
          >
            <option value="">All Stock Statuses</option>
            <option value="OK">Optimal Stock Level</option>
            <option value="LOW">Low Stock alert limits</option>
            <option value="OUT">Out of Stock empty levels</option>
          </select>
        </div>
      </div>

      {/* 3. Catalog Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table_products">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-50/75 select-none">
                <th className="py-4.5 px-6 font-semibold cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </div>
                </th>
                <th className="py-4.5 px-5 font-semibold">Category</th>
                <th className="py-4.5 px-5 font-semibold">Supplier</th>
                <th className="py-4.5 px-5 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center gap-1">
                    <span>Quantity</span>
                    {sortBy === 'quantity' && (sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </div>
                </th>
                <th className="py-4.5 px-5 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('unitPrice')}>
                  <div className="flex items-center gap-1">
                    <span>Unit Price</span>
                    {sortBy === 'unitPrice' && (sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </div>
                </th>
                <th className="py-4.5 px-5 font-semibold">Status</th>
                {canModify && <th className="py-4.5 px-6 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-mono text-xs">
                    No matching catalog products identified for the selected filter configuration.
                  </td>
                </tr>
              ) : (
                currentItems.map((product) => {
                  const isOut = product.quantity === 0;
                  const isLow = product.quantity <= product.minStockThreshold && product.quantity > 0;

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-50/40 transition-colors group ${
                        isOut ? 'bg-red-50/10' : isLow ? 'bg-amber-50/10' : ''
                      }`}
                    >
                      {/* Name / Description */}
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="font-semibold text-xs text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 max-w-xs">{product.description}</div>
                      </td>

                      {/* Category field */}
                      <td className="py-4 px-5 text-xs font-semibold text-gray-600">
                        {product.category?.name || <span className="text-gray-300 font-normal">Unclassified</span>}
                      </td>

                      {/* Supplier field */}
                      <td className="py-4 px-5 text-xs text-gray-500 font-medium">
                        {product.supplier?.name || <span className="text-gray-300 font-normal">No source</span>}
                      </td>

                      {/* Quantity field */}
                      <td className="py-4 px-5 text-xs font-mono font-bold text-gray-700">
                        {product.quantity}
                      </td>

                      {/* Unit Price field */}
                      <td className="py-4 px-5 text-xs font-mono font-semibold text-gray-900">
                        ${product.unitPrice.toFixed(2)}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-5 text-xs">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold font-mono tracking-wide uppercase border border-red-200">
                            <PackageX className="h-3 w-3" />
                            <span>Out</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono tracking-wide uppercase border border-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Low</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-850 text-[10px] font-bold font-mono tracking-wide uppercase border border-emerald-200">
                            <PackageCheck className="h-3 w-3" />
                            <span>OK</span>
                          </span>
                        )}
                      </td>

                      {/* CRUD Actions Panel (Strict role visibility check) */}
                      {canModify && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              title="Modify product files"
                              id={`edit_prod_${product.id}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            
                            <button
                              onClick={() => setIsDeleting(product.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete product definition"
                              id={`delete_prod_${product.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer-styled Pagination UI container */}
        <div className="px-6 py-4.5 bg-gray-50/75 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono font-medium">
            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600 font-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CRUD PRODUCT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 font-sans tracking-tight">
                  {editingProduct ? 'Modify Product Specifications' : 'Add New Inventory Product'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Please populate all required details correctly.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Product Label / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dual Band Wi-Fi Routers"
                  {...register('name', { required: 'Product name label is required.' })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                  id="form_prod_name"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Description Details
                </label>
                <textarea
                  placeholder="Enter detailed technical features and product properties..."
                  rows={2}
                  {...register('description')}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                />
              </div>

              {/* Category & Supplier Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Mapped Category *
                  </label>
                  <select
                    {...register('categoryId', { required: 'Category assignment is required.' })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Supplier Partner *
                  </label>
                  <select
                    {...register('supplierId', { required: 'Supplier mapping is required.' })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
                  >
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Stock and Threshold values */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Initial Stock (Qty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register('quantity', { 
                      required: 'Stock value is required.', 
                      min: { value: 0, message: 'Stock quantity cannot be less than zero.' }
                    })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none"
                    id="form_prod_qty"
                  />
                  {errors.quantity && <p className="text-red-500 text-[9px] mt-1 font-bold">{errors.quantity.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('unitPrice', { 
                      required: 'Unit Price required.',
                      min: { value: 0, message: 'Pricing must be greater than or equal to 0.' }
                    })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none"
                  />
                  {errors.unitPrice && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.unitPrice.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 font-mono tracking-wider uppercase mb-1" title="Minimum Stock Threshold limit">
                    Min Alert Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5"
                    {...register('minStockThreshold', { 
                      required: 'A alert threshold limit must be defined.',
                      min: { value: 1, message: 'Alert limit must be at least 1 unit.' }
                    })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none"
                  />
                  {errors.minStockThreshold && <p className="text-red-500 text-[9px] mt-1 font-bold">{errors.minStockThreshold.message}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
                  id="btn_form_submit"
                >
                  {editingProduct ? 'Save Changes' : 'Initialize Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleting(null)}></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-2xl border border-gray-150 shadow-2xl p-6 text-center animate-shake">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            
            <h3 className="text-sm font-bold text-slate-800">Confirm Record Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Are you absolutely sure you want to drop product <strong>"{products.find(p => p.id === isDeleting)?.name}"</strong> from catalog lists? This action has cascading audit influences.
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setIsDeleting(null)}
                className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Keep Record
              </button>
              <button
                onClick={() => {
                  const target = products.find(p => p.id === isDeleting);
                  if (target) handleDeleteProduct(target.id, target.name);
                }}
                className="flex-1 py-1 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                id="btn_confirm_purge"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
