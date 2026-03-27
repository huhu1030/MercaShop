export { PaymentMethod } from '@mercashop/shared';
import type { Document } from 'mongoose';
import type { OrderDocument } from '../models/Order';

export type Order = Omit<OrderDocument, keyof Document> & { _id: string };
export type OrderLine = Order['orderLines'][number];
