import { Controller, Get, Post, Put, Route, Tags, Query, Body, Path, Security } from 'tsoa';
import { ITenantConfig } from '@mercashop/shared';
import * as tenantService from '../services/tenantService';

interface CreateTenantBody {
  name: string;
  slug: string;
  domains: string[];
  branding: { logo: string; primaryColor: string; appName: string };
  contactEmail: string;
}

@Route('api/tenants')
@Tags('Tenant')
export class TenantController extends Controller {
  @Get('config')
  public async getTenantConfig(@Query() domain: string): Promise<ITenantConfig> {
    const config = await tenantService.getTenantConfig(domain);
    if (!config) {
      this.setStatus(404);
      throw new Error('Tenant not found');
    }
    return config;
  }

  @Post('')
  @Security('BearerAuth')
  public async createTenant(@Body() body: CreateTenantBody): Promise<{ tenant: any }> {
    const tenant = await tenantService.createTenant(body);
    this.setStatus(201);
    return { tenant };
  }

  @Put('{id}')
  @Security('BearerAuth')
  public async updateTenant(@Path() id: string, @Body() body: Partial<CreateTenantBody>): Promise<{ tenant: any }> {
    const tenant = await tenantService.updateTenant(id, body);
    if (!tenant) {
      this.setStatus(404);
      throw new Error('Tenant not found');
    }
    return { tenant };
  }
}
