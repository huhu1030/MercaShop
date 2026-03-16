import { useState, useEffect } from 'react';
import type { ITenantConfig } from '@mercashop/shared/api-client';
import { api } from '../services/apiClientSetup';

export function useTenant() {
  const [tenant, setTenant] = useState<ITenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const domain = window.location.hostname;
    api.getTenantConfig({ domain })
      .then(setTenant)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to fetch tenant config:', message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tenant) {
      document.documentElement.style.setProperty('--primary-color', tenant.branding.primaryColor);
    }
  }, [tenant]);

  return { tenant, loading };
}
