import { Controller, Get, OperationId, Path, Request, Route, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { publicService } from '../services/publicService';
import { IPublicEstablishment, IPublicProduct } from '@mercashop/shared';

@Route('api/public')
@Tags('Public')
export class PublicController extends Controller {
  @Get('establishments')
  @OperationId('getPublicEstablishments')
  public async getEstablishments(@Request() request: ExpressRequest): Promise<IPublicEstablishment[]> {
    const tenantId = request.tenantId!;
    return publicService.getEstablishments(tenantId);
  }

  @Get('establishments/{establishmentId}/products')
  @OperationId('getPublicProductsByEstablishment')
  public async getProductsByEstablishment(@Path() establishmentId: string, @Request() request: ExpressRequest): Promise<IPublicProduct[]> {
    const tenantId = request.tenantId!;
    return publicService.getProductsByEstablishment(tenantId, establishmentId);
  }
}
