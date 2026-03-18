import { Schema, model, Document } from 'mongoose';

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  domains: string[];
  branding: {
    logo: string;
    primaryColor: string;
    appName: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  identityPlatformTenantId: string;
}

const tenantSchema = new Schema<TenantDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    domains: [{ type: String }],
    branding: {
      logo: { type: String, default: '' },
      primaryColor: { type: String, default: '#b973e3' },
      appName: { type: String, default: '' },
    },
    contact: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    identityPlatformTenantId: { type: String, required: true },
  },
  { timestamps: true },
);

tenantSchema.index({ domains: 1 });
tenantSchema.index({ slug: 1 }, { unique: true });

export const TenantModel = model<TenantDocument>('Tenant', tenantSchema);
