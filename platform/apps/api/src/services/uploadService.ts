import { getBucket } from '../config/gcp';
import * as productService from './productService';

export async function uploadProductImage(tenantId: string, productId: string, file: Express.Multer.File): Promise<string> {
  const filePath = `tenants/${tenantId}/products/${productId}/${file.originalname}`;
  const bucket = getBucket();
  const blob = bucket.file(filePath);

  await blob.save(file.buffer, {
    metadata: { contentType: file.mimetype },
  });

  const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  await productService.updateProductPhoto(productId, tenantId, url);

  return url;
}

export async function listImages(tenantId: string, prefix?: string): Promise<string[]> {
  const searchPrefix = prefix ? `tenants/${tenantId}/${prefix}` : `tenants/${tenantId}/`;

  const bucket = getBucket();
  const [files] = await bucket.getFiles({ prefix: searchPrefix });
  return files.map((f) => f.name);
}
