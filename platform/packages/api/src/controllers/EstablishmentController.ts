import { Controller, Get, Patch, Route, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { EstablishmentModel } from '../models';

@Route('api/establishments')
export class EstablishmentController extends Controller {
  @Get('')
  @Security('BearerAuth')
  public async getEstablishments(@Request() req: ExpressRequest): Promise<{ establishments: any[] }> {
    const establishments = await EstablishmentModel.find({ tenantId: req.tenantId });
    return { establishments };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getEstablishment(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ establishment: any }> {
    const establishment = await EstablishmentModel.findOne({ _id: id, tenantId: req.tenantId });
    if (!establishment) {
      this.setStatus(404);
      throw new Error('Establishment not found');
    }
    return { establishment };
  }

  @Patch('status')
  @Security('BearerAuth')
  public async updateStatus(
    @Request() req: ExpressRequest,
    @Body() body: { establishmentId: string; status: string },
  ): Promise<{ establishment: any }> {
    const establishment = await EstablishmentModel.findOneAndUpdate(
      { _id: body.establishmentId, tenantId: req.tenantId },
      { status: body.status },
      { new: true },
    );
    if (!establishment) {
      this.setStatus(404);
      throw new Error('Establishment not found');
    }
    return { establishment };
  }
}
