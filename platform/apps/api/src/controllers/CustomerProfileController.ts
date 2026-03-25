import { Controller, Get, Put, Route, Tags, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import type { ICustomerProfile } from '@mercashop/shared';
import * as customerProfileService from '../services/customerProfileService';

interface UpdateCustomerProfileBody {
  billingInformation?: {
    name?: string;
    email?: string;
    phone?: string;
    vatNumber?: string;
  };
  deliveryAddress?: {
    street?: string;
    number?: string;
    zipCode?: string;
    city?: string;
    municipality?: string;
    comment?: string;
  };
}

@Route('api/customer-profile')
@Tags('CustomerProfile')
export class CustomerProfileController extends Controller {
  @Get('me')
  @Security('BearerAuth')
  public async getMyProfile(@Request() req: ExpressRequest): Promise<ICustomerProfile> {
    const { uid } = req.firebaseUser!;
    const tenantId = req.tenantId!;
    return customerProfileService.getOrCreateProfile(tenantId, uid);
  }

  @Put('me')
  @Security('BearerAuth')
  public async updateMyProfile(
    @Request() req: ExpressRequest,
    @Body() body: UpdateCustomerProfileBody,
  ): Promise<ICustomerProfile> {
    const { uid } = req.firebaseUser!;
    const tenantId = req.tenantId!;
    return customerProfileService.updateProfile(tenantId, uid, body);
  }
}
