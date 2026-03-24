import { BrowserRouter } from 'react-router-dom';
import { useBranding } from './hooks/useBranding';
import { StorefrontShell } from './components/StorefrontShell';
import { LoadingScreen } from './components/LoadingScreen';
import { StoreNotFound } from './components/StoreNotFound';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './AppRoutes';

export default function App() {
  const { branding, loading, error } = useBranding();

  if (loading) return <LoadingScreen />;
  if (error || !branding) return <StoreNotFound />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <StorefrontShell branding={branding}>
          <AppRoutes />
        </StorefrontShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
