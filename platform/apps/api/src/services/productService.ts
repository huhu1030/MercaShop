import { ProductModel } from '../models';
import type { ProductDocument } from '../models/Product';
import type { CreateProductBody, UpdateProductBody, ProductResponse } from '../dtos/product.dto';

export async function createProduct(tenantId: string, body: CreateProductBody): Promise<ProductResponse> {
  const doc = await ProductModel.create({ tenantId, ...body });
  const created = await ProductModel.findById(doc._id).lean<ProductResponse>();
  if (!created) throw new Error('Failed to read created product');
  return created;
}

export async function findProductById(id: string, tenantId: string): Promise<ProductResponse | null> {
  return ProductModel.findOne({ _id: id, tenantId }).lean<ProductResponse>();
}

export async function findProductsByEstablishment(tenantId: string, establishmentId: string): Promise<ProductResponse[]> {
  return ProductModel.find({ tenantId, establishmentId }).lean<ProductResponse[]>();
}

export async function deleteProduct(id: string, tenantId: string): Promise<void> {
  await ProductModel.findOneAndDelete({ _id: id, tenantId });
}

export async function updateProductQuantity(id: string, tenantId: string, quantity: number): Promise<ProductResponse | null> {
  return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { quantity }, { new: true }).lean<ProductResponse>();
}

export async function updateProduct(
  id: string,
  tenantId: string,
  body: UpdateProductBody,
): Promise<ProductResponse | null> {
  return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { $set: body }, { new: true }).lean<ProductResponse>();
}

export async function updateProductPhoto(productId: string, tenantId: string, url: string): Promise<void> {
  await ProductModel.findOneAndUpdate({ _id: productId, tenantId }, { photo: url });
}
