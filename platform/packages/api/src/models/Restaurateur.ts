import { Schema, model, Document } from 'mongoose';

export interface RestaurateurDocument extends Document {
  tenantId: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  vatNumber?: string;
}

const restaurateurSchema = new Schema<RestaurateurDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    firebaseUid: { type: String, required: true, index: true },
    email: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    vatNumber: { type: String, default: '' },
  },
  { timestamps: true },
);

restaurateurSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const RestaurateurModel = model<RestaurateurDocument>('Restaurateur', restaurateurSchema);
