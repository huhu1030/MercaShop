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
  optionGroups: Array<{
    name: string;
    required: boolean;
    selectionMode: 'exactlyOne' | 'upToN' | 'anyNumber';
    maxSelections?: number;
    choices: Array<{
      name: string;
      extraPrice: number;
      maxQuantity: number;
    }>;
  }>;
}

const optionChoiceSchema = new Schema(
  {
    name: { type: String, required: true },
    extraPrice: { type: Number, required: true, default: 0 },
    maxQuantity: { type: Number, required: true, default: 1 },
  },
  { _id: false },
);

const optionGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    required: { type: Boolean, required: true, default: false },
    selectionMode: {
      type: String,
      enum: ['exactlyOne', 'upToN', 'anyNumber'],
      required: true,
    },
    maxSelections: { type: Number },
    choices: { type: [optionChoiceSchema], required: true },
  },
  { _id: false },
);

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
    optionGroups: { type: [optionGroupSchema], default: [] },
  },
  { timestamps: true },
);

productSchema.index({ tenantId: 1, establishmentId: 1 });

export const ProductModel = model<ProductDocument>('Product', productSchema);
