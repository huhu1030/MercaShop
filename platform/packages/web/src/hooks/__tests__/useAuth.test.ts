import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, Auth, Unsubscribe, NextOrObserver } from 'firebase/auth';

const { mockOnAuthStateChanged, mockSignInWithEmailAndPassword, mockSignOut } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn<
    (auth: Auth, nextOrObserver: NextOrObserver<User | null>) => Unsubscribe
  >(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
}));

import { useAuth } from '../useAuth';

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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in loading state', () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets user when auth state changes', () => {
    const mockUser = createMockUser({ uid: 'test-uid', email: 'test@example.com' });

    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(mockUser);
      }
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
