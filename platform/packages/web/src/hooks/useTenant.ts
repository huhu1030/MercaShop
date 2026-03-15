import { useState, useEffect } from 'react';
import { ITenantConfig } from '@mercashop/shared';

export function useTenant() {
  const [tenant, setTenant] = useState<ITenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const domain = window.location.hostname;
    const apiUrl = import.meta.env.VITE_API_URL;

    fetch(`${apiUrl}/tenant/config?domain=${encodeURIComponent(domain)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch tenant config: ${res.status}`);
        return res.json() as Promise<ITenantConfig>;
      })
      .then(setTenant)
      .catch((err: Error) => console.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tenant) {
      document.documentElement.style.setProperty('--primary-color', tenant.branding.primaryColor);
    }
  }, [tenant]);

  return { tenant, loading };
}
