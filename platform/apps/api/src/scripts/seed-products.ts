import mongoose from 'mongoose';
import { env } from '../config/env';
import { EstablishmentModel, ProductModel, TenantModel } from '../models';

type SeedProduct = {
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  location: string;
};

const seedProducts: SeedProduct[] = [
  {
    name: 'Coca-Cola 330ml',
    description: 'Classic cola in a chilled can.',
    category: 'Drinks',
    price: 2.5,
    quantity: 48,
    location: 'Cooler A1',
  },
  {
    name: 'Coca-Cola Zero 330ml',
    description: 'Zero sugar cola with the same crisp taste.',
    category: 'Drinks',
    price: 2.5,
    quantity: 36,
    location: 'Cooler A1',
  },
  {
    name: 'Fanta Orange 330ml',
    description: 'Sparkling orange soda.',
    category: 'Drinks',
    price: 2.4,
    quantity: 30,
    location: 'Cooler A2',
  },
  {
    name: 'Sprite 330ml',
    description: 'Lemon-lime soda served cold.',
    category: 'Drinks',
    price: 2.4,
    quantity: 30,
    location: 'Cooler A2',
  },
  {
    name: 'Still Water 500ml',
    description: 'Bottled still mineral water.',
    category: 'Drinks',
    price: 1.8,
    quantity: 60,
    location: 'Cooler A3',
  },
  {
    name: 'Sparkling Water 500ml',
    description: 'Refreshing carbonated mineral water.',
    category: 'Drinks',
    price: 1.9,
    quantity: 40,
    location: 'Cooler A3',
  },
  {
    name: 'Red Bull 250ml',
    description: 'Energy drink for a quick boost.',
    category: 'Drinks',
    price: 3.2,
    quantity: 24,
    location: 'Cooler A4',
  },
  {
    name: 'Orange Juice 330ml',
    description: 'Smooth orange juice carton.',
    category: 'Drinks',
    price: 2.9,
    quantity: 20,
    location: 'Cooler A4',
  },
  {
    name: 'Salted Peanuts',
    description: 'Roasted salted peanuts snack pack.',
    category: 'Snacks',
    price: 2.2,
    quantity: 28,
    location: 'Shelf B1',
  },
  {
    name: 'Trail Mix',
    description: 'Mix of nuts, raisins, and seeds.',
    category: 'Snacks',
    price: 3.6,
    quantity: 18,
    location: 'Shelf B1',
  },
  {
    name: 'Protein Bar Chocolate',
    description: 'Chocolate-flavored protein bar.',
    category: 'Snacks',
    price: 2.8,
    quantity: 22,
    location: 'Shelf B2',
  },
  {
    name: 'Granola Bar Honey Oat',
    description: 'Soft baked oat bar with honey.',
    category: 'Snacks',
    price: 1.9,
    quantity: 34,
    location: 'Shelf B2',
  },
  {
    name: 'Lay\'s Classic',
    description: 'Classic salted potato chips.',
    category: 'Chips',
    price: 2.7,
    quantity: 26,
    location: 'Shelf C1',
  },
  {
    name: 'Doritos Nacho Cheese',
    description: 'Corn chips with nacho cheese flavor.',
    category: 'Chips',
    price: 2.9,
    quantity: 24,
    location: 'Shelf C1',
  },
  {
    name: 'Pringles Original',
    description: 'Stacked potato crisps in a can.',
    category: 'Chips',
    price: 3.1,
    quantity: 20,
    location: 'Shelf C2',
  },
  {
    name: 'Kettle Sea Salt',
    description: 'Crunchy kettle-cooked chips.',
    category: 'Chips',
    price: 3.3,
    quantity: 18,
    location: 'Shelf C2',
  },
  {
    name: 'Snickers',
    description: 'Chocolate bar with peanuts and caramel.',
    category: 'Candy',
    price: 1.8,
    quantity: 40,
    location: 'Shelf D1',
  },
  {
    name: 'Mars Bar',
    description: 'Chocolate bar with nougat and caramel.',
    category: 'Candy',
    price: 1.8,
    quantity: 32,
    location: 'Shelf D1',
  },
  {
    name: 'M&M\'s Peanut',
    description: 'Candy-coated peanuts in a sharing bag.',
    category: 'Candy',
    price: 2.6,
    quantity: 24,
    location: 'Shelf D2',
  },
  {
    name: 'Haribo Goldbears',
    description: 'Classic fruit gummy bears.',
    category: 'Candy',
    price: 2.4,
    quantity: 26,
    location: 'Shelf D2',
  },
  {
    name: 'Oreo Cookies',
    description: 'Chocolate sandwich cookies.',
    category: 'Biscuits',
    price: 2.7,
    quantity: 24,
    location: 'Shelf E1',
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Crunchy cookies with chocolate chips.',
    category: 'Biscuits',
    price: 2.9,
    quantity: 18,
    location: 'Shelf E1',
  },
  {
    name: 'Instant Noodles Chicken',
    description: 'Quick meal cup with chicken flavor.',
    category: 'Convenience',
    price: 3.4,
    quantity: 16,
    location: 'Shelf F1',
  },
  {
    name: 'Microwave Popcorn Butter',
    description: 'Butter flavored popcorn for quick prep.',
    category: 'Convenience',
    price: 2.5,
    quantity: 14,
    location: 'Shelf F1',
  },
];

async function seedProductsForEstablishment(): Promise<void> {
  const uri = `${env.databaseUrl}/${env.databaseName}`;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const tenant = await TenantModel.findOne({ slug: 'local-dev' });
  if (!tenant) {
    console.error('Tenant "local-dev" not found. Run seed-tenant first.');
    process.exit(1);
  }

  const establishment = await EstablishmentModel.findOne({
    tenantId: tenant._id.toString(),
    slug: 'dev-store',
  });

  if (!establishment) {
    console.error('Establishment "dev-store" not found. Run seed-establishment first.');
    process.exit(1);
  }

  const operations = seedProducts.map((product) => ({
    updateOne: {
      filter: {
        tenantId: tenant._id.toString(),
        establishmentId: establishment._id.toString(),
        name: product.name,
      },
      update: {
        $set: {
          ...product,
          tenantId: tenant._id.toString(),
          establishmentId: establishment._id.toString(),
          serialNumber: '',
          photo: '',
        },
      },
      upsert: true,
    },
  }));

  const result = await ProductModel.bulkWrite(operations);
  const products = await ProductModel.find({
    tenantId: tenant._id.toString(),
    establishmentId: establishment._id.toString(),
  }).sort({ category: 1, name: 1 });

  establishment.products = products.map((product) => product._id.toString());
  await establishment.save();

  console.log(
    `Seeded ${products.length} products for ${establishment.name}. ` +
      `Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}`,
  );

  await mongoose.disconnect();
}

seedProductsForEstablishment().catch((err) => {
  console.error('Failed to seed products:', err);
  process.exit(1);
});
