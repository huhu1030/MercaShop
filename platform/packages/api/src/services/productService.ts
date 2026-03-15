import { ProductModel } from '../models';

interface CreateProductData {
  tenantId: string;
  name: string;
  establishmentId: string;
  description?: string;
  category: string;
  price: number;
  location?: string;
  quantity?: number;
  serialNumber?: string;
}

export async function createProduct(data: CreateProductData) {
  return ProductModel.create(data);
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

export async function updateProductPhoto(productId: string, tenantId: string, url: string) {
  await ProductModel.findOneAndUpdate({ _id: productId, tenantId }, { photo: url });
}
