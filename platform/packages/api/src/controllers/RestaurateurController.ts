import { Controller, Get, Post, Route, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { RestaurateurModel } from '../models';

interface CreateRestaurateurBody {
  email: string;
  firstName: string;
  lastName: string;
  vatNumber?: string;
}

@Route('api/restaurateurs')
export class RestaurateurController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createRestaurateur(
    @Request() req: ExpressRequest,
    @Body() body: CreateRestaurateurBody,
  ): Promise<{ restaurateur: any }> {
    const restaurateur = await RestaurateurModel.create({
      tenantId: req.tenantId,
      firebaseUid: req.firebaseUser!.uid,
      ...body,
    });
    this.setStatus(201);
    return { restaurateur };
  }

  @Get('me')
  @Security('BearerAuth')
  public async getMe(@Request() req: ExpressRequest): Promise<{ restaurateur: any }> {
    const restaurateur = await RestaurateurModel.findOne({
      tenantId: req.tenantId,
      firebaseUid: req.firebaseUser!.uid,
    });
    if (!restaurateur) {
      this.setStatus(404);
      throw new Error('Restaurateur not found');
    }
    return { restaurateur };
  }
}
