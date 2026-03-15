import { Controller, Get, Post, Put, Delete, Route, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { UserModel } from '../models';
import { firebaseAuth } from '../config/firebase';

interface CreateUserBody {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

@Route('api/users')
export class UserController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createUser(
    @Request() req: ExpressRequest,
    @Body() body: CreateUserBody,
  ): Promise<{ user: any }> {
    const { uid, email, tenantId } = req.firebaseUser!;

    const existing = await UserModel.findOne({ tenantId, firebaseUid: uid });
    if (existing) {
      this.setStatus(409);
      return { user: existing };
    }

    const user = await UserModel.create({
      tenantId,
      firebaseUid: uid,
      firstName: body.firstName,
      lastName: body.lastName,
      email: email.toLowerCase(),
      phone: body.phone ?? '',
    });

    this.setStatus(201);
    return { user };
  }

  @Get('me')
  @Security('BearerAuth')
  public async getMe(@Request() req: ExpressRequest): Promise<{ user: any }> {
    const user = await UserModel.findOne({
      tenantId: req.tenantId,
      firebaseUid: req.firebaseUser!.uid,
    });
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }
    return { user };
  }

  @Put('me')
  @Security('BearerAuth')
  public async updateMe(
    @Request() req: ExpressRequest,
    @Body() body: UpdateUserBody,
  ): Promise<{ user: any }> {
    const user = await UserModel.findOneAndUpdate(
      { tenantId: req.tenantId, firebaseUid: req.firebaseUser!.uid },
      body,
      { new: true },
    );
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }
    return { user };
  }

  @Delete('me')
  @Security('BearerAuth')
  public async deleteMe(@Request() req: ExpressRequest): Promise<{ message: string }> {
    const { uid } = req.firebaseUser!;
    const ipTenantId = req.tenant!.identityPlatformTenantId;

    await UserModel.findOneAndDelete({ tenantId: req.tenantId, firebaseUid: uid });
    await firebaseAuth.tenantManager().authForTenant(ipTenantId).deleteUser(uid);
    return { message: 'Account deleted' };
  }
}
