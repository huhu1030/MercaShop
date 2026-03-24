import mongoose from 'mongoose';
import { TenantModel } from '../models/Tenant';
import { EstablishmentModel } from '../models/Establishment';
import { env } from '../config/env';

async function seedEstablishment(): Promise<void> {
  const uri = `${env.databaseUrl}/${env.databaseName}`;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const tenant = await TenantModel.findOne({ slug: 'local-dev' });
  if (!tenant) {
    console.error('Tenant "local-dev" not found. Run seed-tenant first.');
    process.exit(1);
  }

  const establishment = await EstablishmentModel.create({
    tenantId: tenant._id.toString(),
    name: 'Dev Store',
    category: 'General',
    phone: '+31600000000',
    logo: '',
    address: {
      street: 'Keizersgracht',
      number: '1',
      zipCode: '1015AA',
      municipality: 'Amsterdam',
      city: 'Amsterdam',
      country: 'NL',
    },
    slug: 'dev-store',
    paymentMethods: ['CARD', 'CASH', 'BANCONTACT'],
    ownerId: 'local-dev-owner',
    products: [],
    description: 'Local development establishment',
    status: 'OPEN',
    location: { latitude: 52.3676, longitude: 4.9041 },
  });

  console.log('Establishment created:', establishment.toJSON());
  await mongoose.disconnect();
}

seedEstablishment().catch((err) => {
  console.error('Failed to seed establishment:', err);
  process.exit(1);
});
