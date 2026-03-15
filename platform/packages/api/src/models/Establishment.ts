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
  restaurateurId: string;
  products: string[];
  description?: string;
  path?: string;
  mode?: string;
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
    restaurateurId: { type: String, required: true },
    products: [{ type: String }],
    description: { type: String, default: '' },
    path: { type: String, default: '' },
    mode: { type: String, default: '' },
    status: { type: String, default: 'OPEN' },
    openingHours: { type: String, default: '' },
    location: { type: locationSchema, required: true },
  },
  { timestamps: true },
);

establishmentSchema.index({ tenantId: 1, restaurateurId: 1 });

export const EstablishmentModel = model<EstablishmentDocument>('Establishment', establishmentSchema);
