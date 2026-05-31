

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  dismissToast: (id: string) => void;
  checkLowStockAlerts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'], duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Avoid exact duplicate toasts showing within 1.5 seconds
    setToasts((prev) => {
      const duplicate = prev.some(t => t.message === message && t.type === type);
      if (duplicate) return prev;
      return [...prev, { id, message, type }];
    });

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const showSuccess = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const showWarning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);
  const showInfo = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);

  // Checks low-stock items and displays alerts
  const checkLowStockAlerts = useCallback(async () => {
    try {
      const products = await productService.getAll();
      products.forEach((p) => {
        if (p.quantity === 0) {
          addToast(`OUT OF STOCK: "${p.name}" requires urgent restock!`, 'error', 6000);
        } else if (p.quantity <= p.minStockThreshold) {
          addToast(`LOW STOCK: "${p.name}" quantity (${p.quantity}) is below minimum threshold of ${p.minStockThreshold}.`, 'warning', 5000);
        }
      });
    } catch {
      // Fail silently for background checks
    }
  }, [addToast]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
        checkLowStockAlerts,
      }}
    >
      {children}

      {/* Beautiful Toast Overlay Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgClass = 'bg-white border-l-4 border-blue-500 shadow-md text-gray-800';
            let icon = <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;

            if (toast.type === 'success') {
              bgClass = 'bg-emerald-50 border-emerald-500 border-l-4 shadow-lg text-emerald-950';
              icon = <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />;
            } else if (toast.type === 'error') {
              bgClass = 'bg-red-50 border-red-500 border-l-4 shadow-lg text-red-950';
              icon = <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
            } else if (toast.type === 'warning') {
              bgClass = 'bg-amber-50 border-amber-500 border-l-4 shadow-lg text-amber-950';
              icon = <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded bg-white shadow-xl border border-gray-100 ${bgClass}`}
              >
                {icon}
                <p className="text-sm font-medium pr-6 leading-relaxed flex-grow">{toast.message}</p>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
