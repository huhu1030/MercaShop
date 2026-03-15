import { Controller, Patch, Get, Route, Path, Query, Security, Request as TsoaRequest, UploadedFile } from 'tsoa';
import { Request } from 'express';
import { ProductModel } from '../models';
import { cloudStorage } from '../config/firebase';

@Route('api')
export class UploadController extends Controller {
  @Patch('products/{productId}/image')
  @Security('BearerAuth')
  public async uploadProductImage(
    @TsoaRequest() req: Request,
    @Path() productId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const tenantId = req.tenantId!;
    const filePath = `tenants/${tenantId}/products/${productId}/${file.originalname}`;
    const bucket = cloudStorage.bucket();
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
    @TsoaRequest() req: Request,
    @Query() prefix?: string,
  ): Promise<{ files: string[] }> {
    const tenantId = req.tenantId!;
    const searchPrefix = prefix
      ? `tenants/${tenantId}/${prefix}`
      : `tenants/${tenantId}/`;

    const bucket = cloudStorage.bucket();
    const [files] = await bucket.getFiles({ prefix: searchPrefix });
    return { files: files.map((f) => f.name) };
  }
}
