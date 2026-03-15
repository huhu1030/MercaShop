import { Controller, Patch, Get, Route, Path, Query, Security, Request, UploadedFile } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { ProductModel } from '../models';
import { getBucket } from '../config/gcp';

@Route('api')
export class UploadController extends Controller {
  @Patch('products/{productId}/image')
  @Security('BearerAuth')
  public async uploadProductImage(
    @Request() req: ExpressRequest,
    @Path() productId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const tenantId = req.tenantId!;
    const filePath = `tenants/${tenantId}/products/${productId}/${file.originalname}`;
    const bucket = getBucket();
    const blob = bucket.file(filePath);

    await blob.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    await blob.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    await ProductModel.findOneAndUpdate(
      { _id: productId, tenantId },
      { photo: url },
    );

    return { url };
  }

  @Get('images')
  @Security('BearerAuth')
  public async listImages(
    @Request() req: ExpressRequest,
    @Query() prefix?: string,
  ): Promise<{ files: string[] }> {
    const tenantId = req.tenantId!;
    const searchPrefix = prefix
      ? `tenants/${tenantId}/${prefix}`
      : `tenants/${tenantId}/`;

    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: searchPrefix });
    return { files: files.map((f) => f.name) };
  }
}
