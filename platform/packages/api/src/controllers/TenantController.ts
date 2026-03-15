import { Controller, Get, Post, Put, Route, Query, Body, Path, Security } from 'tsoa';
import { TenantModel } from '../models';
import { ITenantConfig } from '@mercashop/shared';
import { createIdentityPlatformTenant } from '../services/identityPlatformService';

interface CreateTenantBody {
  name: string;
  slug: string;
  domains: string[];
  branding: { logo: string; primaryColor: string; appName: string };
  contactEmail: string;
}

@Route('api/tenants')
export class TenantController extends Controller {
  @Get('config')
  public async getTenantConfig(@Query() domain: string): Promise<ITenantConfig> {
    const tenant = await TenantModel.findOne({ domains: domain, isActive: true });
    if (!tenant) {
      this.setStatus(404);
      throw new Error('Tenant not found');
    }
    return {
      id: tenant._id.toString(),
      name: tenant.name,
      branding: tenant.branding,
      identityPlatformTenantId: tenant.identityPlatformTenantId,
    };
  }

  @Post('')
  @Security('BearerAuth')
  public async createTenant(@Body() body: CreateTenantBody): Promise<{ tenant: any }> {
    const ipTenantId = await createIdentityPlatformTenant(body.name);

    const tenant = await TenantModel.create({
      ...body,
      identityPlatformTenantId: ipTenantId,
    });

    this.setStatus(201);
    return { tenant };
  }

  @Put('{id}')
  @Security('BearerAuth')
  public async updateTenant(@Path() id: string, @Body() body: Partial<CreateTenantBody>): Promise<{ tenant: any }> {
    const tenant = await TenantModel.findByIdAndUpdate(id, body, { new: true });
    if (!tenant) {
      this.setStatus(404);
      throw new Error('Tenant not found');
    }
    return { tenant };
  }
}
