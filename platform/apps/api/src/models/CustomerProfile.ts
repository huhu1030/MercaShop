import { type Document, Schema, model } from 'mongoose';

export interface CustomerProfileDocument extends Document {
  tenantId: string;
  userId: string;
  billingInformation: {
    name: string;
    email: string;
    phone: string;
    vatNumber: string;
  };
  deliveryAddress: {
    street: string;
    number: string;
    zipCode: string;
    city: string;
    municipality: string;
    comment: string;
  };
}

const customerProfileSchema = new Schema<CustomerProfileDocument>(
  {
    tenantId: { type: String, required: true },
    userId: { type: String, required: true },
    billingInformation: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      vatNumber: { type: String, default: '' },
    },
    deliveryAddress: {
      street: { type: String, default: '' },
      number: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      city: { type: String, default: '' },
      municipality: { type: String, default: '' },
      comment: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

customerProfileSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export const CustomerProfileModel = model<CustomerProfileDocument>('CustomerProfile', customerProfileSchema);
