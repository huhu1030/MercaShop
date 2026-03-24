import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { useEstablishment } from '../hooks/useEstablishment';

vi.mock('@mercashop/shared/api-client', () => ({
  getPublicApi: () => ({
    getPublicEstablishments: vi.fn().mockResolvedValue([
      {
        _id: 'est-1',
        name: 'Main Store',
        slug: 'main-store',
        paymentMethods: ['CARD', 'CASH'],
      },
    ]),
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useEstablishment', () => {
  it('fetches and returns the first establishment', async () => {
    const { result } = renderHook(() => useEstablishment(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.establishment).toBeDefined();
    expect(result.current.establishment?.name).toBe('Main Store');
  });
});
