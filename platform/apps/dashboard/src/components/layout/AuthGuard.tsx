import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {LoadingScreen} from '../ui/LoadingScreen';
import type {ReactNode} from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
