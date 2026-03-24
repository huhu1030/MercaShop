import { useState, useEffect } from 'react';
import type { ITenantBranding } from '@mercashop/shared';

export function useBranding() {
  const [branding, setBranding] = useState<ITenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/branding/config.json')
      .then((res) => {
        if (!res.ok) throw new Error('Store not found');
        return res.json() as Promise<ITenantBranding>;
      })
      .then((data) => {
        setBranding(data);
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        if (data.favicon) {
          const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link');
          link.rel = 'icon';
          link.href = `/branding/${data.favicon}`;
          document.head.appendChild(link);
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Store not found';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { branding, loading, error };
}
