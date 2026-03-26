import { ProductModel } from '../models';
import type { ProductDocument } from '../models/Product';
import type { CreateProductBody, UpdateProductBody } from '../dtos/product.dto';

export async function createProduct(tenantId: string, body: CreateProductBody) {
  return ProductModel.create({ tenantId, ...body });
}

export async function findProductById(id: string, tenantId: string) {
  return ProductModel.findOne({ _id: id, tenantId });
}

export async function findProductsByEstablishment(tenantId: string, establishmentId: string) {
  return ProductModel.find({ tenantId, establishmentId });
}

export async function deleteProduct(id: string, tenantId: string) {
  await ProductModel.findOneAndDelete({ _id: id, tenantId });
}

export async function updateProductQuantity(id: string, tenantId: string, quantity: number) {
  return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { quantity }, { new: true });
}

export async function updateProduct(
  id: string,
  tenantId: string,
  body: UpdateProductBody,
): Promise<ProductDocument | null> {
  return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { $set: body }, { new: true });
}

export async function updateProductPhoto(productId: string, tenantId: string, url: string) {
  await ProductModel.findOneAndUpdate({ _id: productId, tenantId }, { photo: url });
}
