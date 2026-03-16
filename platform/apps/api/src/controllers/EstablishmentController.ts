import { Controller, Get, Patch, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import * as establishmentService from '../services/establishmentService';

@Route('api/establishments')
@Tags('Establishment')
export class EstablishmentController extends Controller {
  @Get('')
  @Security('BearerAuth')
  public async getEstablishments(@Request() req: ExpressRequest): Promise<{ establishments: any[] }> {
    const establishments = await establishmentService.findEstablishments(req.tenantId!);
    return { establishments };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getEstablishment(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ establishment: any }> {
    const establishment = await establishmentService.findEstablishmentById(id, req.tenantId!);
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
    const establishment = await establishmentService.updateEstablishmentStatus(
      body.establishmentId,
      req.tenantId!,
      body.status,
    );
    if (!establishment) {
      this.setStatus(404);
      throw new Error('Establishment not found');
    }
    return { establishment };
  }
}
