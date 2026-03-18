import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, Auth, Unsubscribe, NextOrObserver } from 'firebase/auth';
import type { ReactNode } from 'react';

const {
  mockOnAuthStateChanged,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockAuth,
} = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn<
    (auth: Auth, nextOrObserver: NextOrObserver<User | null>) => Unsubscribe
  >(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockAuth: { tenantId: null as string | null },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
}));

vi.mock('../../config/firebase', () => ({
  auth: mockAuth,
}));

import { AuthProvider, useAuth } from '../useAuth';

function createMockUser(overrides: { uid: string; email: string }): User {
  return {
    uid: overrides.uid,
    email: overrides.email,
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
  } satisfies User;
}

function createWrapper(tenantId?: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider tenantId={tenantId}>{children}</AuthProvider>;
  };
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.tenantId = null;
  });

  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('stays in loading state when tenantId is undefined', () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(undefined),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
  });

  it('subscribes to auth state when tenantId is provided', () => {
    const mockUser = createMockUser({ uid: 'test-uid', email: 'test@example.com' });

    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(mockUser);
      }
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper('test-tenant'),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('sets error on signIn failure and re-throws', async () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn());
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper('test-tenant'),
    });

    let thrown: Error | undefined;
    await act(async () => {
      try {
        await result.current.signIn('bad@email.com', 'wrong');
      } catch (err) {
        thrown = err instanceof Error ? err : new Error(String(err));
      }
    });

    expect(thrown?.message).toBe('Invalid credentials');
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('clears error on successful signIn', async () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn());
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: createMockUser({ uid: '1', email: 'a@b.com' }) });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper('test-tenant'),
    });

    await act(() => result.current.signIn('a@b.com', 'pass'));

    expect(result.current.error).toBeNull();
  });

  it('calls signOut on logout', async () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn());
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper('test-tenant'),
    });

    await act(() => result.current.logout());

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth(), {
      wrapper: createWrapper('test-tenant'),
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
