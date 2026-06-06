import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Truck, 
  PlusCircle, 
  MinusCircle, 
  History, 
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, hasRole } = useAuth();

  const menuItems = [
  {
    title: 'Navigation',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'USER'] },
      { name: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'MANAGER', 'USER'] },
      { name: 'Categories', path: '/categories', icon: Tags, roles: ['ADMIN', 'MANAGER', 'USER'] },
      { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['ADMIN', 'MANAGER', 'USER'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Stock Entry', path: '/stock-entry', icon: PlusCircle, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Stock Exit', path: '/stock-exit', icon: MinusCircle, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Movement History', path: '/movements', icon: History, roles: ['ADMIN', 'MANAGER', 'USER'] },
    ]
  }
];
  return (
    <div className="flex flex-col h-full bg-white text-slate-600 border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 shrink-0">
          <div className="w-4 h-4 border-2 border-white"></div>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-base font-bold tracking-tight text-blue-900 leading-none">StockManager</span>
          <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase mt-1">Enterprise v1.2</span>
        </div>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {menuItems.map((section, idx) => {
          // Filter section items that the current user role is allowed to view
          const allowedItems = section.items.filter(item => 
            !item.roles || hasRole(item.roles as any)
          );

          if (allowedItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              <h5 className="px-4 text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                {section.title}
              </h5>
              <div className="space-y-0.5">
                {allowedItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) => 
                      `group flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const Icon = item.icon;
                      return (
                        <>
                          <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                          <span className="flex-grow text-left">{item.name}</span>
                        </>
                      );
                    }}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Quick Info & Security Badge at the bottom */}
      {user && (
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="bg-slate-900 rounded-xl p-4 flex items-center text-left">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`} 
              alt={user.name} 
              className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 object-cover flex-shrink-0 mr-3"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase leading-none">{user.role}</p>
              <p className="text-xs font-semibold text-white truncate mt-1">{user.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
