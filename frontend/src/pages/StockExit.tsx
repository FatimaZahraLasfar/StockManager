/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { type Product } from '../types';
import { 
  MinusCircle, 
  ArrowLeft, 
  Package, 
  ArrowDownRight, 
  Calendar, 
  FileText, 
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const StockExit: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      productId: '',
      quantity: 1,
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    }
  });

  const productIdWatch = watch('productId');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const list = await productService.getAll();
        setProducts(list);
        if (list.length > 0) {
          setValue('productId', String(list[0].id));
        }
      } catch {
        showError('Failed to sync active product catalogs lists.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [setValue]);

  // Sync selected product profile specs
  useEffect(() => {
    if (productIdWatch) {
      const found = products.find(p => String(p.id) === String(productIdWatch));
      setSelectedProduct(found || null);
    } else {
      setSelectedProduct(null);
    }
  }, [productIdWatch, products]);

  const onSubmit = async (data: any) => {
    if (!user || !selectedProduct) return;
    
    const exitQuantity = Number(data.quantity);
    
    // Safety check on exit quantity compared to actual in-stock quantity limits
    if (exitQuantity > selectedProduct.quantity) {
      showError(`Insufficient stock. You cannot exit ${exitQuantity} units when Only ${selectedProduct.quantity} units are in-stock!`);
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryService.createMovement({
        productId: data.productId,
        type: 'EXIT',
        quantity: exitQuantity,
        date: new Date(data.date).toISOString(),
        notes: data.notes,
        userEmail: user.email,
        userName: user.name,
      });

      showSuccess(`Stock dispatches fulfilled successfully. '${selectedProduct.name}' levels adjusted.`);
      // Reset form controls
      reset({
        productId: products[0]?.id || '',
        quantity: 1,
        date: new Date().toISOString().substring(0, 10),
        notes: '',
      });
      // Refresh quantities representations
      const refreshedList = await productService.getAll();
      setProducts(refreshedList);
    } catch (err: any) {
      showError(err.message || 'Unable to register stock dispatch files.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="text-xs font-mono text-gray-400">Loading catalog items...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* 1. Module Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-red-50 text-red-650 rounded-2xl">
            <MinusCircle className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight leading-none">Register Stock Dispatch (Exit)</h1>
            <p className="text-xs text-gray-500 mt-1.5">Dispatch inventory materials for project consumption, scrap, or client fulfillment.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Active Catalog</span>
        </button>
      </div>

      {/* 2. Form content block */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          
          {/* Select Product Dropdowns */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
              Select Dispatch Target Product *
            </label>
            <select
              {...register('productId', { required: 'Target product selection is mandatory.' })}
              className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 cursor-pointer font-medium"
              id="exit_product_id"
            >
              {products.map(p => {
                const isOut = p.quantity === 0;
                return (
                  <option key={p.id} value={p.id} disabled={isOut}>
                    {p.name} {isOut ? '(OUT OF STOCK)' : `(Available: ${p.quantity} units)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Stock levels warnings block */}
          {selectedProduct && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              selectedProduct.quantity === 0
                ? 'bg-red-50/50 border-red-100'
                : selectedProduct.quantity <= selectedProduct.minStockThreshold
                  ? 'bg-amber-50/30 border-amber-100'
                  : 'bg-blue-50/20 border-blue-50'
            }`}>
              <div className="flex items-center gap-3">
                <Package className={`h-5 w-5 flex-shrink-0 ${
                  selectedProduct.quantity === 0 ? 'text-red-500' : 'text-blue-500'
                }`} />
                <div className="text-left leading-none">
                  <h4 className="text-xs font-bold text-slate-885 font-sans">{selectedProduct.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono inline-block mt-1 font-bold uppercase">
                    Alert Threshold: {selectedProduct.minStockThreshold} units
                  </span>
                </div>
              </div>

              <div className="flex gap-4 font-mono font-bold text-xs">
                <div className="text-center bg-white border border-gray-150 rounded px-2.5 py-1 min-w-[75px]">
                  <span className="block text-[9px] text-gray-400 leading-none">In-Stock</span>
                  <span className={`font-black block mt-0.5 ${
                    selectedProduct.quantity === 0 
                      ? 'text-red-650 animate-pulse' 
                      : selectedProduct.quantity <= selectedProduct.minStockThreshold
                        ? 'text-amber-700'
                        : 'text-slate-800'
                  }`}>
                    {selectedProduct.quantity} units
                  </span>
                </div>
                <div className="text-center bg-white border border-gray-150 rounded px-2.5 py-1 min-w-[75px]">
                  <span className="block text-[9px] text-gray-400 leading-none">Unit Price</span>
                  <span className="text-slate-800 block mt-0.5">${selectedProduct.unitPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Dispatch Volume Qty */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
                Dispatch Amount Qty *
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                {...register('quantity', { 
                  required: 'Outgoing volume is required.',
                  min: { value: 1, message: 'Minimum dispatch size starts at 1 unit.' }
                })}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-900 focus:outline-none"
                id="exit_quantity"
              />
              {errors.quantity && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.quantity.message}</p>}
            </div>

            {/* Date logs */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
                Dispatch Date *
              </label>
              <input
                type="date"
                {...register('date', { required: 'Stock validation date mandatory.' })}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-800 focus:outline-none cursor-pointer"
                id="exit_date"
              />
              {errors.date && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.date.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
              Reason / Dispatch Reference
            </label>
            <textarea
              placeholder="e.g. Dispatched to corporate staff. Internal inventory slip #OUT-9430."
              rows={3}
              {...register('notes')}
              className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              id="exit_notes"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
            {selectedProduct && selectedProduct.quantity === 0 ? (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 border border-red-100 text-[10px] text-red-700 font-bold max-w-sm">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                <span>Product is completely out of stock. Dispatch operations are locked.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-none">
                <span>Verification limits active.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (selectedProduct && selectedProduct.quantity === 0)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="btn_exit_submit"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reconciling Dispatch...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4.5 w-4.5 text-white" />
                  <span>Verify Stock Dispatch</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
