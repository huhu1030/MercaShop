import { Schema, model, Document } from 'mongoose';

export interface EstablishmentDocument extends Document {
  tenantId: string;
  name: string;
  category: string;
  phone: string;
  logo: string;
  banner?: string;
  address: {
    street: string;
    number: string;
    zipCode: string;
    municipality: string;
    city: string;
    country: string;
  };
  ownerId: string;
  products: string[];
  description?: string;
  path?: string;
  mode?: string;
  slug: string;
  paymentMethods: string[];
  status: string;
  openingHours?: string;
  location: { latitude: number; longitude: number };
}

const addressSchema = new Schema(
  {
    street: { type: String, default: '' },
    number: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    municipality: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false },
);

const locationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false },
);

const establishmentSchema = new Schema<EstablishmentDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: '' },
    phone: { type: String, default: '' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    address: { type: addressSchema, required: true },
    ownerId: { type: String, required: true },
    products: [{ type: String }],
    description: { type: String, default: '' },
    path: { type: String, default: '' },
    mode: { type: String, default: '' },
    slug: { type: String, required: true },
    paymentMethods: { type: [String], default: ['CARD', 'CASH'] },
    status: { type: String, default: 'OPEN' },
    openingHours: { type: String, default: '' },
    location: { type: locationSchema, required: true },
  },
  { timestamps: true },
);

establishmentSchema.index({ tenantId: 1, ownerId: 1 });
establishmentSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const EstablishmentModel = model<EstablishmentDocument>('Establishment', establishmentSchema);
