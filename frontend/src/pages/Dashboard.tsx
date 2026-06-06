
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import type { DashboardStats, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Package, 
  Tags, 
  Truck, 
  AlertTriangle, 
  XOctagon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Info,
  CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [criticalProducts, setCriticalProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modern soft palette colors
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const fetchDashboardData = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const dashboardStats = await inventoryService.getDashboardStats();
      setStats(dashboardStats);

      // Load critical stock items
      const allProducts = await productService.getAll();
      const critical = allProducts.filter(p => p.quantity <= p.minStockThreshold);
      setCriticalProducts(critical);
    } catch (err: any) {
      showError('Failed to synchronize server dashboard statistics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRefresh = async () => {
    await fetchDashboardData(true);
    showSuccess('Dashboard statistics refreshed. Live audit metrics compiled.');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-mono text-xs tracking-wider">Syncing dashboard statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-150 rounded-xl text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900">Database Synchronization Error</h3>
        <p className="text-gray-500 text-sm mt-1">Unable to compile or construct active inventory indexes.</p>
        <button
          onClick={() => fetchDashboardData()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
        >
          Retry Connection Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="text-left">
          <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight">
            Welcome Back, <span className="text-blue-600">{user?.name}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            Logged in authority clearance matches <strong className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{user?.role}</strong> constraints.
          </p>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-65 ml-auto sm:ml-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Re-compiling...' : 'Recalculate Stats'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Products card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start justify-between group transition-all">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">Total SKU</span>
            <h3 className="text-3xl font-mono font-bold text-slate-900">{stats.totalProducts}</h3>
            <span className="inline-flex items-center text-[10.5px] text-slate-500 font-medium font-sans">Recorded items</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2">
            <Package className="h-5 w-5" />
          </div>
        </div>

        {/* Total Categories card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start justify-between group transition-all">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">Categories</span>
            <h3 className="text-3xl font-mono font-bold text-slate-900">{stats.totalCategories}</h3>
            <span className="inline-flex items-center text-[10.5px] text-slate-500 font-medium font-sans">Asset structures</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2">
            <Tags className="h-5 w-5" />
          </div>
        </div>

        {/* Total Suppliers card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start justify-between group transition-all">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">All Suppliers</span>
            <h3 className="text-3xl font-mono font-bold text-slate-900">{stats.totalSuppliers}</h3>
            <span className="inline-flex items-center text-[10.5px] text-slate-500 font-medium font-sans font-semibold">Active entities</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        {/* Low Stock card */}
        <div className={`p-6 rounded-2xl border flex items-start justify-between group transition-all ${
          stats.lowStockCount > 0 ? 'bg-white ring-2 ring-red-500/10 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Low Stock</span>
            <h3 className={`text-3xl font-mono font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {stats.lowStockCount}
            </h3>
            <span className="inline-flex items-center text-[10.5px] text-slate-400 font-sans">Requires attention</span>
          </div>
          <div className={`p-3 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2 ${
            stats.lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Out Of Stock Card */}
        <div className={`p-6 rounded-2xl border flex items-start justify-between group transition-all ${
          stats.outOfStockCount > 0 ? 'bg-red-50/40 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Out of Stock</span>
            <h3 className={`text-3xl font-mono font-bold ${stats.outOfStockCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {stats.outOfStockCount}
            </h3>
            <span className="inline-flex items-center text-[10.5px] text-slate-400 font-sans">Immediate restock</span>
          </div>
          <div className={`p-3 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2 ${
            stats.outOfStockCount > 0 ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-500'
          }`}>
            <XOctagon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recharts Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Monthly Stock Movements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Stock Movement (30 Days)</h4>
              <p className="text-[11px] text-slate-400 mt-1">Comparison logs for monthly inbound arrivals vs outbound dispatches.</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold font-mono rounded-lg uppercase">
              Operational Flow
            </span>
          </div>

          <div className="h-80 w-full text-xs">
  {stats.monthlyMovements.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      <TrendingUp className="h-8 w-8 mb-2 opacity-30" />
      <p className="text-xs font-medium">No movement data available yet</p>
      <p className="text-[10px]">Record stock entries or exits to see trends</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stats.monthlyMovements}
        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" fontSize={10} />
        <YAxis tickLine={false} stroke="#94a3b8" fontSize={10} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0' }} 
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        <Bar dataKey="entries" name="Inbound (+)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={30} />
        <Bar dataKey="exits" name="Outbound (-)" fill="#cbd5e1" radius={[2, 2, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>
        </div>

        {/* Chart B: Category Distribution & Products Added */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col">
          <div className="flex items-center justify-between text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Stock Distribution by Category</h4>
              <p className="text-[11px] text-slate-400 mt-1">Current aggregate stock unit quantities segmented by catalog groups.</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold font-mono rounded-lg uppercase">
              Distribution
            </span>
          </div>

          <div className="h-80 w-full flex flex-col md:flex-row items-center justify-center gap-6">
  {stats.categoryDistribution.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      <Tags className="h-8 w-8 mb-2 opacity-30" />
      <p className="text-xs font-medium">No categories assigned</p>
      <p className="text-[10px]">Add products with categories to see distribution</p>
    </div>
  ) : (
    <>
      {/* Pie Chart */}
      <div className="w-1/2 min-w-[180px] h-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.categoryDistribution}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {stats.categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} units`, 'Inventory Stock']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 w-full md:w-auto">
        {stats.categoryDistribution.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
              />
              <span className="text-xs font-semibold text-gray-700">{entry.name}</span>
            </div>
            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              {entry.value} units
            </span>
          </div>
        ))}
      </div>
    </>
  )}
</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Products added history */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Products Added Per Month</h4>
              <p className="text-[11px] text-slate-400 mt-1">Growth history of unique catalog item definitions introduced over time.</p>
            </div>
          </div>

          <div className="h-64 w-full text-xs">
  {stats.productsAddedByMonth.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      <Package className="h-8 w-8 mb-2 opacity-30" />
      <p className="text-xs font-medium">No product data available</p>
      <p className="text-[10px]">Start adding products to see growth trends</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={stats.productsAddedByMonth}
        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" fontSize={10} />
        <YAxis tickLine={false} stroke="#94a3b8" fontSize={10} allowDecimals={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
        />
        <Area type="monotone" dataKey="count" name="New Products" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdded)" />
      </AreaChart>
    </ResponsiveContainer>
  )}
</div>
        </div>

        {/* Side Panel: Critical stocks summary list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Critical Inventory</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Products that are out of stock or tracking below their configured alert thresholds.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 divide-y divide-slate-100 mt-3 pr-1">
            {criticalProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2 animate-bounce" />
                <p className="text-xs font-semibold text-slate-800">All Levels Optimal</p>
                <p className="text-[10px] text-slate-400 mt-1">No items under alerts limit.</p>
              </div>
            ) : (
              criticalProducts.map((p, index) => {
                const isOut = p.quantity === 0;
                // Calculate percentage metric for display
                const pct = isOut ? 0 : Math.min(100, Math.round((p.quantity / (p.minStockThreshold || 10)) * 100));
                return (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="min-w-0 pr-2 text-left">
                      <h5 className="text-sm font-semibold text-slate-900 truncate">{p.name}</h5>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        ID: {p.id}
                      </span>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-mono font-bold ${isOut ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.quantity} left
                      </p>
                      <div className="w-12 h-1 bg-slate-100 mt-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isOut ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50 p-2.5 rounded-lg">
            <div className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span>Real-time limits audit active.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
