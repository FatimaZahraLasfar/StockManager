import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import type { StockMovement } from '../types';
import { 
  Download, 
  Search, 
  History, 
  PlusCircle, 
  MinusCircle, 
  Filter, 
  SlidersHorizontal,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const MovementHistory: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '', 'ENTRY', 'EXIT'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await inventoryService.getMovements();
        setMovements(data);
      } catch {
        showError('Failed to load stock movement log history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovements();
  }, []);

  // Filter compilations
  const filteredMovements = movements.filter(m => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      m.productName.toLowerCase().includes(query) ||
      (m.notes || '').toLowerCase().includes(query) ||
      m.userName.toLowerCase().includes(query) ||
      m.userEmail.toLowerCase().includes(query);

    const matchesType = !typeFilter || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Export to CSV client-side download trigger (Real Integration, No mock!)
  const handleExportCSV = () => {
    try {
      if (filteredMovements.length === 0) {
        showError('No logs currently identified to compile into a CSV sheet.');
        return;
      }

      // 1. Column headers
      const headers = ['Log ID', 'Product Name', 'Movement Type', 'Quantity', 'Verification Date', 'Assoc Notes', 'Operator Staff', 'Operator Email'];
      
      // 2. Format records rows
      const rows = filteredMovements.map(m => [
        m.id,
        `"${m.productName.replace(/"/g, '""')}"`,
        m.type,
        m.quantity,
        m.date,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
        `"${m.userName.replace(/"/g, '""')}"`,
        m.userEmail
      ]);

      // 3. Assemble CSV text
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      // 4. Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `StockManager_Movements_${new Date().toISOString().substring(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Movement history exported successfully to Microsoft Excel/CSV spreadsheet format!');
    } catch {
      showError('Failed to execute CSV compilation routine.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-gray-400">Loading audit narratives...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <History className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight leading-none">Global Stock Movement Logs</h1>
            <p className="text-xs text-gray-400 mt-1.5">Track every stock intake and dispatch logged since system launch.</p>
          </div>
        </div>

        {/* Dynamic CSV Export Trigger Button */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all ml-auto sm:ml-0"
          id="btn_export_movements"
        >
          <Download className="h-4 w-4" />
          <span>Export logs to CSV</span>
        </button>
      </div>

      {/* 2. Filters Row */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <h4 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">Interactive Filter Engine</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Text Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by product, operator, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-950 placeholder-gray-400 focus:outline-none"
              id="search_history"
            />
          </div>

          {/* Type Selector (Entries / Exits) */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none cursor-pointer font-medium"
            id="filter_type"
          >
            <option value="">All Movement Types</option>
            <option value="ENTRY">Stock Intake Arrivals (+)</option>
            <option value="EXIT">Stock Dispatches Outflows (-)</option>
          </select>
        </div>
      </div>

      {/* 3. Movement Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table_movements">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-50/75 select-none">
                <th className="py-4.5 px-6 font-semibold">Movement Date</th>
                <th className="py-4.5 px-5 font-semibold">Product Name</th>
                <th className="py-4.5 px-5 font-semibold">Type</th>
                <th className="py-4.5 px-5 font-semibold">Quantity</th>
                <th className="py-4.5 px-5 font-semibold">Assoc Notes</th>
                <th className="py-4.5 px-6 font-semibold text-right">Auditor Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-mono">
                    No active movement logs recorded under current filter rules.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isEntry = m.type === 'ENTRY';
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Date */}
                      <td className="py-4 px-6 text-gray-500 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          <span>{new Date(m.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </td>

                      {/* Product display */}
                      <td className="py-4 px-5 font-bold text-slate-850">
                        {m.productName}
                      </td>

                      {/* Movement Type Badge */}
                      <td className="py-4 px-5">
                        {isEntry ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-250 leading-none">
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>INTAKE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold font-mono border border-red-150 leading-none">
                            <MinusCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>DISPATCH</span>
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className={`py-4 px-5 font-mono font-bold ${
                        isEntry ? 'text-emerald-650' : 'text-red-650'
                      }`}>
                        {isEntry ? '+' : '-'}{m.quantity} units
                      </td>

                      {/* Associated Notes */}
                      <td className="py-4 px-5 max-w-xs text-gray-450 truncate" title={m.notes}>
                        {m.notes || <em className="text-gray-300 font-normal">No custom reference logs.</em>}
                      </td>

                      {/* Operator Staff profile details */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 font-semibold text-slate-800 text-xs">
                          <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                          <span>{m.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tight block mt-0.5">{m.userEmail}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-gray-100 px-6 py-4.5 text-[11px] text-gray-450 text-left font-semibold">
          <span>Log registers meet strict security JWT compliance requirements. Dropped products records remain saved for audit stability.</span>
        </div>
      </div>

    </div>
  );
};
