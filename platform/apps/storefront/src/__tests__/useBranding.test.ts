import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBranding } from '../hooks/useBranding';
import type { ITenantBranding } from '@mercashop/shared';

const mockBranding: ITenantBranding = {
  appName: 'Test Store',
  primaryColor: '#ff0000',
  logo: 'logo.png',
  favicon: 'favicon.ico',
};

describe('useBranding', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBranding());

    expect(result.current.loading).toBe(true);
    expect(result.current.branding).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches branding from /branding/config.json and returns it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBranding),
    } as Response);

    const { result } = renderHook(() => useBranding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.branding).toEqual(mockBranding);
    expect(result.current.error).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledWith('/branding/config.json');
  });

  it('sets CSS custom property for primary color', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBranding),
    } as Response);

    const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');

    renderHook(() => useBranding());

    await waitFor(() => {
      expect(setPropertySpy).toHaveBeenCalledWith('--primary-color', '#ff0000');
    });
  });

  it('sets favicon link element', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBranding),
    } as Response);

    renderHook(() => useBranding());

    await waitFor(() => {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      expect(link?.href).toContain('/branding/favicon.ico');
    });
  });

  it('sets error when fetch returns non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useBranding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.branding).toBeNull();
    expect(result.current.error).toBe('Store not found');
  });

  it('sets error when fetch throws network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBranding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.branding).toBeNull();
    expect(result.current.error).toBe('Network error');
  });
});
