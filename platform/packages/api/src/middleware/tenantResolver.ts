import { Request, Response, NextFunction } from 'express';
import { TenantModel } from '../models';

const tenantCache = new Map<string, { tenant: any; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function tenantResolver(req: Request, res: Response, next: NextFunction): Promise<void> {
  const tenantId = req.headers['x-tenant-id'] as string | undefined;

  if (!tenantId) {
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      try {
        const hostname = new URL(origin as string).hostname;
        const cached = tenantCache.get(hostname);
        if (cached && cached.expiresAt > Date.now()) {
          req.tenantId = cached.tenant._id.toString();
          req.tenant = cached.tenant;
          return next();
        }

        const tenant = await TenantModel.findOne({ domains: hostname, isActive: true });
        if (tenant) {
          tenantCache.set(hostname, { tenant, expiresAt: Date.now() + CACHE_TTL });
          req.tenantId = tenant._id.toString();
          req.tenant = tenant;
          return next();
        }
      } catch {
        // Invalid URL, continue
      }
    }
  }

  if (tenantId) {
    const cached = tenantCache.get(tenantId);
    if (cached && cached.expiresAt > Date.now()) {
      req.tenantId = cached.tenant._id.toString();
      req.tenant = cached.tenant;
      return next();
    }

    const tenant = await TenantModel.findById(tenantId);
    if (tenant && tenant.isActive) {
      tenantCache.set(tenantId, { tenant, expiresAt: Date.now() + CACHE_TTL });
      req.tenantId = tenant._id.toString();
      req.tenant = tenant;
      return next();
    }
  }

  res.status(400).json({ message: 'Tenant not found or inactive' });
}
