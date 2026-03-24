import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuth, initFirebaseWithTenant } from '../lib/firebase';
import { getTenantApi, getUserApi } from '@mercashop/shared/api-client';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  tenantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const initAuth = useCallback(async () => {
    if (authInitialized) return;
    try {
      const hostname = window.location.hostname;
      const response = await getTenantApi().getTenantConfig(hostname);
      const ipTenantId = response.data.identityPlatformTenantId;
      setTenantId(ipTenantId);

      const auth = initFirebaseWithTenant(ipTenantId);
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      setAuthInitialized(true);
    } catch {
      setLoading(false);
    }
  }, [authInitialized]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await initAuth();
      const auth = initFirebaseWithTenant(tenantId!);
      await signInWithEmailAndPassword(auth, email, password);
    },
    [initAuth, tenantId],
  );

  const signUp = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      await initAuth();
      const auth = initFirebaseWithTenant(tenantId!);
      await createUserWithEmailAndPassword(auth, email, password);
      await getUserApi().createUser({ firstName, lastName });
    },
    [initAuth, tenantId],
  );

  const signInWithGoogleFn = useCallback(async () => {
    await initAuth();
    const auth = initFirebaseWithTenant(tenantId!);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      await getUserApi().getMe();
    } catch {
      const displayName = result.user.displayName ?? '';
      const [firstName, ...lastParts] = displayName.split(' ');
      await getUserApi().createUser({ firstName, lastName: lastParts.join(' ') });
    }
  }, [initAuth, tenantId]);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      tenantId,
      signIn,
      signUp,
      signInWithGoogle: signInWithGoogleFn,
      logout,
      initAuth,
    }),
    [user, loading, tenantId, signIn, signUp, signInWithGoogleFn, logout, initAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
