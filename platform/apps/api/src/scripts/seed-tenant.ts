import mongoose from 'mongoose';
import { TenantModel } from '../models/Tenant';
import { env } from '../config/env';

async function seedTenant(): Promise<void> {
  const uri = `${env.databaseUrl}/${env.databaseName}`;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const tenant = await TenantModel.create({
    name: 'Local Dev',
    slug: 'local-dev',
    domains: ['localhost'],
    branding: {
      logo: '',
      primaryColor: '#b973e3',
      appName: 'MercaShop Dev',
    },
    contact: {
      firstName: 'Dev',
      lastName: 'User',
      email: 'dev@mercashop.local',
      phone: '',
    },
    isActive: true,
    identityPlatformTenantId: 'local-dev-h2wn2',
  });

  console.log('Tenant created:', tenant.toJSON());
  await mongoose.disconnect();
}

seedTenant().catch((err) => {
  console.error('Failed to seed tenant:', err);
  process.exit(1);
});
