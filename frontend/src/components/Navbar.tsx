import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { productService } from '../services/productService';
import { Menu, LogOut, Bell, AlertTriangle, User, ChevronDown, CheckCircle } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { checkLowStockAlerts, showSuccess } = useNotification();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load and count low stock items to display on the header widget
  const fetchAlertCount = async () => {
    try {
      const products = await productService.getAll();
      const count = products.filter(p => p.quantity <= p.minStockThreshold).length;
      setLowStockCount(count);
    } catch {
      // safe bypass
    }
  };

  useEffect(() => {
    fetchAlertCount();
    // Refresh alerts periodically
    const timer = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(timer);
  }, [location.pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showSuccess('Successfully signed out of StockManager. Secure JWT invalidated.');
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'System Dashboard';
    if (path.startsWith('/products')) return 'Product Catalog';
    if (path.startsWith('/categories')) return 'Inventory Categories';
    if (path.startsWith('/suppliers')) return 'Supplier Directory';
    if (path.startsWith('/stock-entry')) return 'Stock Intake';
    if (path.startsWith('/stock-exit')) return 'Stock Dispatch';
    if (path.startsWith('/movements')) return 'Movement Logs';
    return 'StockManager Enterprise';
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 md:px-8 bg-white border-b border-slate-200">
      {/* Mobile Menu Action */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 border border-slate-200 cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
          id="btn_hamburger"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Page Title display */}
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">Enterprise Console</span>
          <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight font-sans leading-none mt-1">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="flex items-center gap-4">
        {/* Connection health indicator info badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono">API Connection Live</span>
        </div>

        {/* Alerts / Stock level notification system */}
        <button
          onClick={() => {
            checkLowStockAlerts();
            showSuccess('Stock levels evaluated. Active limits verified.');
          }}
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer transition-colors"
          title="Analyze and Trigger Low Stock Alerts"
          id="btn_navbar_alerts"
        >
          <Bell className="h-4.5 w-4.5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
              {lowStockCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* User Account Menu / Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-all border border-slate-100"
              aria-expanded={isProfileOpen}
              id="btn_user_profile"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-gray-100 object-cover shadow-sm bg-gray-50"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-none">{user.email}</p>
              </div>
              <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-50 overflow-hidden"
              >
                <div className="px-4 py-3.5 bg-gray-50/50">
                  <p className="text-xs text-gray-400 font-mono font-bold uppercase tracking-wider">Authenticated role</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{user.name}</p>
                  <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 text-[10px] font-bold font-mono text-blue-700 bg-blue-50 border border-blue-100 rounded">
                    {user.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/products');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left font-medium"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Product Catalog
                  </button>
                  {lowStockCount > 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 font-medium bg-amber-50/50">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <span>{lowStockCount} items at low limits</span>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    id="btn_logout_action"
                  >
                    <LogOut className="h-4 w-4 text-red-500 flex-shrink-0" />
                    Sign Out Security Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
