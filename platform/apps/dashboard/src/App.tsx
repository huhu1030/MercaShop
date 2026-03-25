import { BrowserRouter } from 'react-router-dom';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Toaster } from './components/ui/toaster';
import { useTenant } from './hooks/useTenant';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './AppRoutes';

export default function App() {
  const { tenant, loading: tenantLoading } = useTenant();

  if (tenantLoading) return <LoadingScreen />;

  return (
    <AuthProvider tenantId={tenant?.identityPlatformTenantId}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
