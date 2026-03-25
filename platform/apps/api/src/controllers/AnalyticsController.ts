import { Controller, Get, Path, Query, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { IAnalyticsResponse } from '@mercashop/shared';
import { getEstablishmentAnalytics } from '../services/analyticsService';

@Route('api/analytics')
@Tags('Analytics')
export class AnalyticsController extends Controller {
  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getEstablishmentAnalytics(
    @Request() req: ExpressRequest,
    @Path() establishmentId: string,
    @Query() year?: number,
    @Query() limit?: number,
  ): Promise<IAnalyticsResponse> {
    const tenantId = req.tenantId!;
    const resolvedYear = year ?? new Date().getFullYear();
    const resolvedLimit = [5, 10, 20].includes(limit ?? 0) ? limit! : 5;

    return getEstablishmentAnalytics(tenantId, establishmentId, resolvedYear, resolvedLimit);
  }
}
