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
import {type Product } from '../types';
import { 
  PlusCircle, 
  ArrowLeft, 
  Package, 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  Loader2,
  Info
} from 'lucide-react';

export const StockEntry: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      productId: '',
      quantity: 1,
      date: new Date().toISOString().substring(0, 10), // default to yyyy-MM-dd
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

  // Track product selection changes to update current available displays
  useEffect(() => {
    if (productIdWatch) {
      const found = products.find(p => String(p.id) === String(productIdWatch));
      setSelectedProduct(found || null);
    } else {
      setSelectedProduct(null);
    }
  }, [productIdWatch, products]);

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await inventoryService.createMovement({
        productId: data.productId,
        type: 'ENTRY',
        quantity: Number(data.quantity),
        date: new Date(data.date).toISOString(),
        notes: data.notes,
        userEmail: user.email,
        userName: user.name,
      });

      showSuccess(`Stock in-take entry for '${selectedProduct?.name}' successfully fulfilled!`);
      // Reset form controls
      reset({
        productId: products[0]?.id || '',
        quantity: 1,
        date: new Date().toISOString().substring(0, 10),
        notes: '',
      });
      // Refresh local product quantities lists
      const refreshedList = await productService.getAll();
      setProducts(refreshedList);
    } catch (err: any) {
      showError(err.message || 'Failed to submit in-take operation sheet.');
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
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <PlusCircle className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight leading-none">Register Stock Intake (Entry)</h1>
            <p className="text-xs text-gray-500 mt-1.5">Supplement product levels upon arriving supplier warehouse dispatches.</p>
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

      {/* 2. Main Entry Log Form Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          
          {/* Product Selectors */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
              Select Destination Product *
            </label>
            <select
              {...register('productId', { required: 'Please specify the landing product.' })}
              className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 cursor-pointer font-medium"
              id="entry_product_id"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Supplier: {p.supplier?.name || 'Unknown'})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Metrics Information Panel (Live visual feedback) */}
          {selectedProduct && (
            <div className="p-4 rounded-xl border border-blue-50 bg-blue-50/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="text-left leading-none">
                  <h4 className="text-xs font-bold text-slate-800 font-sans">{selectedProduct.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono inline-block mt-1 uppercase font-bold">Category: {selectedProduct.category?.name || 'Unmapped'}</span>
                </div>
              </div>

              <div className="flex gap-4 font-mono font-bold text-xs">
                <div className="text-center bg-white border border-gray-150 rounded px-2.5 py-1 min-w-[70px]">
                  <span className="block text-[9px] text-gray-400 leading-none">In-Stock</span>
                  <span className="text-slate-800 font-black block mt-0.5">{selectedProduct.quantity} units</span>
                </div>
                <div className="text-center bg-white border border-gray-150 rounded px-2.5 py-1 min-w-[70px]">
                  <span className="block text-[9px] text-gray-400 leading-none">Unit Price</span>
                  <span className="text-slate-800 block mt-0.5">${selectedProduct.unitPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Supplement volume Quantity */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
                Arrival Amount Qty *
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                {...register('quantity', { 
                  required: 'Arrival volume has to be provided.',
                  min: { value: 1, message: 'Minimum stock supplement size starts at 1 unit.' }
                })}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-900 focus:outline-none"
                id="entry_quantity"
              />
              {errors.quantity && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.quantity.message}</p>}
            </div>

            {/* Date logs */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
                Log Arrival Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('date', { required: 'Please lock in verification date.' })}
                  className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-800 focus:outline-none cursor-pointer"
                  id="entry_date"
                />
              </div>
              {errors.date && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.date.message}</p>}
            </div>
          </div>

          {/* Logistics notes */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1.5">
              Operation Notes / Logistics Reason
            </label>
            <textarea
              placeholder="e.g. Verified pallet arrival under Invoice #APEX-291A. Spot checks verified clean packaging."
              rows={3}
              {...register('notes')}
              className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              id="entry_notes"
            />
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-gray-450 bg-slate-50 p-2 rounded-lg">
              <Info className="h-4 w-4 text-emerald-500" />
              <span>Saves immediately to local audit log files.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-75"
              id="btn_entry_submit"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fulfilling Intake...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4.5 w-4.5 text-white" />
                  <span>Verify Stock Intake</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
