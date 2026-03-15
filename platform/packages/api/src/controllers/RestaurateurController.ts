import { Controller, Get, Post, Route, Body, Security, Request as TsoaRequest } from 'tsoa';
import { Request } from 'express';
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
    @TsoaRequest() req: Request,
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
  public async getMe(@TsoaRequest() req: Request): Promise<{ restaurateur: any }> {
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
