
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { Category } from '../types';
import { 
  Plus, 
  Tags, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  FolderOpen,
  CalendarDays,
  Hash,
  Activity,
  Info
} from 'lucide-react';

export const Categories: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Role Checks
  const canModify = hasRole(['Administrator', 'Stock Manager']);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      showError('Failed to fetch product divisions/categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
        showSuccess(`Category "${payload.name}" successfully updated in configuration directory.`);
      } else {
        await categoryService.create(payload);
        showSuccess(`New category "${payload.name}" successfully established.`);
      }

      setIsModalOpen(false);
      reset();
      loadCategories();
    } catch (err: any) {
      showError(err.message || 'Failed to submit category parameters.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.delete(id);
      showSuccess('Category purged successfully from structural catalogs.');
      setDeletingId(null);
      loadCategories();
    } catch (err: any) {
      showError(err.message || 'Purging failed. Active associations exist.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-gray-400">Loading categorizations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight">Product Categorizations</h1>
          <p className="text-xs text-gray-500 mt-1">Classify materials under categorical tags to monitor distributions.</p>
        </div>

        {canModify ? (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all ml-auto sm:ml-0"
            id="btn_add_category"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Category</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-gray-50 border border-gray-150 rounded-lg text-xs text-gray-400 font-mono flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span>Account: Read-Only mode</span>
          </div>
        )}
      </div>

      {/* 2. Bento Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-gray-400 font-mono text-sm border rounded-2xl">
            No active categories defined. Create one to begin structuring inventory.
          </div>
        ) : (
          categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white p-5.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Highlight ribbon representing division */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 opacity-60"></div>
              
              <div className="space-y-3.5">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Tags className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-gray-950 font-sans tracking-tight text-sm leading-none">
                      {category.name}
                    </h3>
                  </div>

                  {/* Quantity indicator tag */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 font-mono text-[10px] font-bold border border-slate-100 uppercase" title="Unique products in this section">
                    <FolderOpen className="w-3 h-3 text-slate-400" />
                    <span>{category.productCount || 0} product(s)</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-450 leading-relaxed min-h-[44px] break-words">
                  {category.description || <em className="text-gray-300 font-normal">No custom description text logged for this category tags cluster.</em>}
                </p>
              </div>

              {/* Metalog logs & Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-mono font-medium text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                  <span>Created: {new Date(category.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* CRUD button actions */}
                {canModify && (
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(category)}
                      className="p-1 px-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded cursor-pointer transition-all h-7 flex items-center justify-center"
                      title="Edit Category Details"
                      id={`edit_cat_${category.id}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeletingId(category.id)}
                      className="p-1 px-2 text-gray-400 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 rounded cursor-pointer transition-all h-7 flex items-center justify-center"
                      title="Purge Category"
                      id={`delete_cat_${category.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. CRUD CATEGORY FORM DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-zoomIn">
            <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between text-left">
              <h3 className="font-bold text-gray-900 text-sm font-sans tracking-tight">
                {editingCategory ? 'Update Categorization' : 'Define New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Category Name / Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storage Racks, Tools"
                  {...register('name', { required: 'Please supply a category label.' })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                  id="form_cat_name"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Summarize product divisions included under this categorization..."
                  rows={3}
                  {...register('description')}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
                  id="btn_form_cat_submit"
                >
                  {editingCategory ? 'Apply Save' : 'Generate Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CONFIRM DELETE DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          
          <div className="relative bg-white w-full max-w-xs rounded-2xl border border-gray-150 shadow-2xl p-5 text-center animate-shake">
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            
            <h3 className="text-xs font-bold text-slate-800">Verify Category Purge</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              Purging category <strong>"{categories.find(c => c.id === deletingId)?.name}"</strong> will remove organizational labels from tracking assets. Are active items clear?
            </p>

            <div className="mt-4.5 flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Retain Tag
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                id="btn_confirm_purge"
              >
                Yes, Purge Tag
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
