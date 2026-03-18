import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { CreatePage } from './pages/products/CreatePage.tsx';
import { ListPage } from './pages/products/ListPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useTenant } from './hooks/useTenant';
import { AuthProvider } from './hooks/useAuth';

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

export default function App() {
  const { tenant, loading: tenantLoading } = useTenant();

  if (tenantLoading) return <LoadingScreen />;

  return (
    <AuthProvider tenantId={tenant?.identityPlatformTenantId}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders" element={<DashboardRoute><OrdersPage /></DashboardRoute>} />
        <Route path="/products" element={<DashboardRoute><ListPage /></DashboardRoute>} />
        <Route path="/products/new" element={<DashboardRoute><CreatePage /></DashboardRoute>} />
        <Route path="/analytics" element={<DashboardRoute><AnalyticsPage /></DashboardRoute>} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
