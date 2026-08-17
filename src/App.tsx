import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Layout } from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/products/Products';
import Categories from '@/pages/categories/Categories';
import Orders from '@/pages/sales/Orders';
import Customers from '@/pages/sales/Customers';
import Leads from '@/pages/crm/Leads';
import Stock from '@/pages/inventory/Stock';
import Warehouses from '@/pages/inventory/Warehouses';
import Movements from '@/pages/inventory/Movements';
import Suppliers from '@/pages/procurement/Suppliers';
import PurchaseOrders from '@/pages/procurement/PurchaseOrders';
import Settings from '@/pages/settings/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    if (!currentUser) {
      login('u1');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sales/orders" element={<Orders />} />
          <Route path="sales/customers" element={<Customers />} />
          <Route path="crm/leads" element={<Leads />} />
          <Route path="inventory/stock" element={<Stock />} />
          <Route path="inventory/warehouses" element={<Warehouses />} />
          <Route path="inventory/transfers" element={<Movements />} />
          <Route path="procurement/suppliers" element={<Suppliers />} />
          <Route path="procurement/purchase-orders" element={<PurchaseOrders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
