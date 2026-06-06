import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboadrLayout';
// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Suppliers } from './pages/Suppliers';
import { StockEntry } from './pages/StockEntry';
import { StockExit } from './pages/StockExit';
import { MovementHistory } from './pages/MovementHistory';

// Redirect helper based on active user login session
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to Dashboard if logged, else Login Form
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Core Sign-In Route */}
            <Route path="/login" element={<Login />} />

            {/* Core Protected System Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Products Catalogs */}
              <Route path="products" element={<Products />} />

              {/* Categories */}
              <Route path="categories" element={<Categories />} />

              {/* Suppliers Directory */}
              <Route path="suppliers" element={<Suppliers />} />

              {/* Operations: Stock Entry (Protected) */}
             <Route path="/stock-entry" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
    <StockEntry />
  </ProtectedRoute>
} />

              {/* Operations: Stock Exit (Protected) */}
              <Route path="/stock-exit" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
    <StockExit />
  </ProtectedRoute>
} />

              {/* Operations: Detailed Movements Audit Logs */}
              <Route path="movements" element={<MovementHistory />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
