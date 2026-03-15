import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  const uri = `${env.databaseUrl}/${env.databaseName}`;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}
