import type {ReactNode} from 'react';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {User, UserCredential} from 'firebase/auth';
import {onAuthStateChanged, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {auth} from '../config/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  tenantId: string | undefined;
}

export function AuthProvider({ children, tenantId }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(true);
      return;
    }

    auth.tenantId = tenantId;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        setError(null);
      }
    });

    return unsubscribe;
  }, [tenantId]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      return credential;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    error,
    signIn,
    logout,
  }), [user, loading, error, signIn, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
