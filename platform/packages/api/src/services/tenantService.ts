import { TenantModel } from '../models';
import { createIdentityPlatformTenant, deleteIdentityPlatformTenant } from './identityPlatformService';
import type { ITenantConfig } from '@mercashop/shared';

interface CreateTenantData {
  name: string;
  slug: string;
  domains: string[];
  branding: { logo: string; primaryColor: string; appName: string };
  contactEmail: string;
}

export async function getTenantConfig(domain: string): Promise<ITenantConfig | null> {
  const tenant = await TenantModel.findOne({ domains: domain, isActive: true });
  if (!tenant) return null;
  return {
    id: tenant._id.toString(),
    name: tenant.name,
    branding: tenant.branding,
    identityPlatformTenantId: tenant.identityPlatformTenantId,
  };
}

export async function createTenant(data: CreateTenantData) {
  let ipTenantId: string | undefined;
  try {
    ipTenantId = await createIdentityPlatformTenant(data.name);
    return await TenantModel.create({
      ...data,
      identityPlatformTenantId: ipTenantId,
    });
  } catch (error) {
    if (ipTenantId) {
      await deleteIdentityPlatformTenant(ipTenantId).catch(() => {});
    }
    throw error;
  }
}

export async function updateTenant(id: string, data: Partial<CreateTenantData>) {
  return TenantModel.findByIdAndUpdate(id, data, { new: true });
}
