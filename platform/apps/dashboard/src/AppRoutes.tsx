import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { CreatePage } from './pages/products/CreatePage.tsx';
import { ListPage } from './pages/products/ListPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EstablishmentPickerPage } from './pages/establishments/EstablishmentPickerPage';

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/establishments" element={<AuthGuard><EstablishmentPickerPage /></AuthGuard>} />
      <Route path="/establishments/:establishmentId/orders" element={<DashboardRoute><OrdersPage /></DashboardRoute>} />
      <Route path="/establishments/:establishmentId/products" element={<DashboardRoute><ListPage /></DashboardRoute>} />
      <Route path="/establishments/:establishmentId/products/new" element={<DashboardRoute><CreatePage /></DashboardRoute>} />
      <Route path="/establishments/:establishmentId/analytics" element={<DashboardRoute><AnalyticsPage /></DashboardRoute>} />
      <Route path="*" element={<Navigate to="/establishments" replace />} />
    </Routes>
  );
}
