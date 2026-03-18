import { Controller, Get, Patch, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import * as establishmentService from '../services/establishmentService';
import type { IEstablishmentSummary } from '@mercashop/shared';
import type { EstablishmentDocument } from '../models/Establishment';

function toSummary(doc: EstablishmentDocument): IEstablishmentSummary {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    status: doc.status,
    logo: doc.logo,
  };
}

@Route('api/establishments')
@Tags('Establishment')
export class EstablishmentController extends Controller {
  @Get('')
  @Security('BearerAuth')
  public async getEstablishments(@Request() req: ExpressRequest): Promise<{ establishments: IEstablishmentSummary[] }> {
    const establishments = await establishmentService.findEstablishments(req.tenantId!);
    return { establishments: establishments.map(toSummary) };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getEstablishment(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ establishment: IEstablishmentSummary }> {
    const establishment = await establishmentService.findEstablishmentById(id, req.tenantId!);
    if (!establishment) {
      this.setStatus(404);
      throw new Error('Establishment not found');
    }
    return { establishment: toSummary(establishment) };
  }

  @Patch('status')
  @Security('BearerAuth')
  public async updateStatus(
    @Request() req: ExpressRequest,
    @Body() body: { establishmentId: string; status: string },
  ): Promise<{ establishment: IEstablishmentSummary }> {
    const establishment = await establishmentService.updateEstablishmentStatus(
      body.establishmentId,
      req.tenantId!,
      body.status,
    );
    if (!establishment) {
      this.setStatus(404);
      throw new Error('Establishment not found');
    }
    return { establishment: toSummary(establishment) };
  }
}
