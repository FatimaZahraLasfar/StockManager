import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supplierService } from '../services/supplierService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { Supplier } from '../types';
import { 
  Plus, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  UserCheck,
  Building,
  Info
} from 'lucide-react';

export const Suppliers: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Dialogs Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Role Checks
  const canModify = hasRole(['Administrator', 'Stock Manager']);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch {
      showError('Failed to synchronize supplier indexes directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    reset({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, data);
        showSuccess(`Supplier partner "${data.name}" successfully updated in directory database.`);
      } else {
        await supplierService.create(data);
        showSuccess(`Supplier partner "${data.name}" successfully registered in database directory.`);
      }

      setIsModalOpen(false);
      reset();
      loadSuppliers();
    } catch (err: any) {
      showError(err.message || 'Failed to submit supplier account worksheet.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierService.delete(id);
      showSuccess('Supplier records dropped successfully.');
      setDeletingId(null);
      loadSuppliers();
    } catch (err: any) {
      showError(err.message || 'Purge rejected. Operational dependencies block drop action.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-gray-400">Loading supply nodes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight">Supplier Node Directory</h1>
          <p className="text-xs text-gray-500 mt-1">Audit active supplier partners, contact methods, and catalog product ratios.</p>
        </div>

        {canModify ? (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all ml-auto sm:ml-0"
            id="btn_add_supplier"
          >
            <Plus className="h-4 w-4" />
            <span>Map New Supplier</span>
          </button>
        ) : (
          <div className="px-3.5 py-1.5 bg-gray-50 border border-gray-150 rounded-lg text-xs text-gray-400 font-mono flex items-center gap-1.5 leading-none">
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span>Read-Only Accounts Active</span>
          </div>
        )}
      </div>

      {/* 2. Suppliers Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-fadeIn">
        {suppliers.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-gray-400 font-mono text-sm border border-dashed rounded-2xl">
            No supplier partner records active. Initialize database files to map supply loops.
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div 
              key={supplier.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Upper row: Partner Name, Product ratios */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-105 transition-transform">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-950 font-sans tracking-tight text-sm">
                        {supplier.name}
                      </h3>
                      <span className="text-[9px] font-mono font-semibold text-gray-400 uppercase">Supplier Node ID: {supplier.id}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-100">
                    <Building className="w-3 h-3 text-emerald-500" />
                    <span>{supplier.productCount || 0} product(s)</span>
                  </span>
                </div>

                {/* Body contact details */}
                <div className="space-y-2 text-xs text-gray-600 font-medium pt-1">
                  {/* Email */}
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50">
                    <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-blue-600 font-mono underline break-all">{supplier.email}</a>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50">
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-mono">{supplier.phone}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50/50">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-gray-500 max-w-xs">{supplier.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Rows */}
              {canModify && (
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditModal(supplier)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-100 hover:text-blue-600 transition-all font-semibold text-xs cursor-pointer"
                    id={`edit_sup_${supplier.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setDeletingId(supplier.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-red-150 hover:text-red-650 transition-all font-semibold text-xs cursor-pointer"
                    id={`delete_sup_${supplier.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Purge Partner</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 3. CRUD DIALOG FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-zoomIn">
            <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between text-left">
              <h3 className="font-bold text-gray-900 text-sm font-sans tracking-tight">
                {editingSupplier ? 'Modify Supplier Profile' : 'Map New Supplier Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Supplier Company / Partner Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Microchips Corp"
                  {...register('name', { required: 'Supplier name label is required.' })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
                  id="form_sup_name"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    placeholder="logistics@partner.com"
                    {...register('email', { 
                      required: 'Email address mandatory.',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid format.' }
                    })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none"
                    id="form_sup_email"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 012-3456"
                    {...register('phone', { required: 'Phone numbers are required.' })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none"
                    id="form_sup_phone"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">
                  Corporate HQ Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Industrial Pkwy, Suite 10, City, State, Country"
                  {...register('address', { required: 'Please enter physical shipping location.' })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
                  id="form_sup_address"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.address.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-3.5 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-650 hover:bg-emerald-750 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer"
                  id="btn_form_sup_submit"
                >
                  {editingSupplier ? 'Apply Save' : 'Generate Partner Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DEFIRM DELETE DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          
          <div className="relative bg-white w-full max-w-xs rounded-2xl border border-gray-150 shadow-2xl p-5 text-center animate-shake">
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-5 w-5" />
            </div>
            
            <h3 className="text-xs font-bold text-slate-850">Verify Supplier Purge</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              Dropping partner <strong>"{suppliers.find(s => s.id === deletingId)?.name}"</strong> will isolate active listings. Are there active contracts outstanding?
            </p>

            <div className="mt-4.5 flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Retain Partner
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer"
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
