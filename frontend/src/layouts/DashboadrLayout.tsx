import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-800">
      {/* 1. Desktop Sidebar Container (always visible on lg width) */}
      <aside className="hidden lg:block w-64 h-full flex-shrink-0">
        <Sidebar />
      </aside>

      {/* 2. Mobile Responsive Sidebar Drawer (Overlay) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden font-sans">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Sidebar drawer body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-64 max-w-[80vw] bg-white shadow-2xl flex flex-col h-full border-r border-slate-250"
            >
              {/* Close Button on Mobile layout */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={closeMobileSidebar}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer border border-slate-200"
                  aria-label="Close sidebar panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar items */}
              <div className="h-full">
                <Sidebar onCloseMobile={closeMobileSidebar} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

        {/* Professional Minimalist Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-8 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} StockManager Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 select-none cursor-pointer">Terms of Audit</span>
            <span className="hover:text-slate-600 select-none cursor-pointer">System Security Specs</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
