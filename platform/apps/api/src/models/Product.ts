import { Schema, model, Document } from 'mongoose';

export interface ProductDocument extends Document {
  tenantId: string;
  name: string;
  establishmentId: string;
  description?: string;
  category: string;
  price: number;
  location?: string;
  quantity: number;
  serialNumber?: string;
  photo?: string;
}

const productSchema = new Schema<ProductDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    establishmentId: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    serialNumber: { type: String, default: '' },
    photo: { type: String, default: '' },
  },
  { timestamps: true },
);

productSchema.index({ tenantId: 1, establishmentId: 1 });

export const ProductModel = model<ProductDocument>('Product', productSchema);
