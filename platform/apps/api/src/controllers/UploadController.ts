import { Controller, Patch, Get, Route, Tags, Path, Query, Security, Request, UploadedFile } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import * as uploadService from '../services/uploadService';

@Route('api')
@Tags('Upload')
export class UploadController extends Controller {
  @Patch('products/{productId}/image')
  @Security('BearerAuth')
  public async uploadProductImage(
    @Request() req: ExpressRequest,
    @Path() productId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const url = await uploadService.uploadProductImage(req.tenantId!, productId, file);
    return { url };
  }

  @Get('images')
  @Security('BearerAuth')
  public async listImages(@Request() req: ExpressRequest, @Query() prefix?: string): Promise<{ files: string[] }> {
    const files = await uploadService.listImages(req.tenantId!, prefix);
    return { files };
  }
}
