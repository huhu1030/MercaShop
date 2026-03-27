import { BrowserRouter } from 'react-router-dom';
import { useBranding } from './hooks/useBranding';
import { StorefrontShell } from './components/StorefrontShell';
import { LoadingScreen } from './components/LoadingScreen';
import { StoreNotFound } from './components/StoreNotFound';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppRoutes } from './AppRoutes';
import { Toaster } from './components/ui/toaster.tsx';

export default function App() {
  const { branding, loading, error } = useBranding();

  if (loading) return <LoadingScreen />;
  if (error || !branding) return <StoreNotFound />;

  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <StorefrontShell branding={branding}>
            <AppRoutes />
          </StorefrontShell>
          <Toaster />
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}
