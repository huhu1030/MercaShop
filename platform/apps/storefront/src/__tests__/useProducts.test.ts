import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useProducts } from '../hooks/useProducts';

const getPublicProductsByEstablishment = vi.fn();

vi.mock('@mercashop/shared/api-client', () => ({
  getPublicApi: () => ({
    getPublicProductsByEstablishment,
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

describe('useProducts', () => {
  beforeEach(() => {
    getPublicProductsByEstablishment.mockReset();
  });

  it('fetches and returns products for an establishment', async () => {
    getPublicProductsByEstablishment.mockResolvedValueOnce([
      {
        _id: 'prod-1',
        name: 'Burger',
        price: 12.5,
        category: 'Meals',
      },
    ]);

    const { result } = renderHook(() => useProducts('est-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getPublicProductsByEstablishment).toHaveBeenCalledWith('est-1');
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0]?.name).toBe('Burger');
  });

  it('does not fetch when establishmentId is undefined', () => {
    const { result } = renderHook(() => useProducts(undefined), { wrapper });

    expect(getPublicProductsByEstablishment).not.toHaveBeenCalled();
    expect(result.current.products).toEqual([]);
  });
});
