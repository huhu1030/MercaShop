import { Schema, model, Document } from 'mongoose';

export interface OrderDocument extends Document {
  tenantId: string;
  userId: string;
  orderDate: number;
  status: string;
  orderLines: Array<{
    item: { _id: string; name: string; quantity: number; price?: number };
  }>;
  establishmentId: string;
  total: number;
  deliveryAddress: Record<string, unknown>;
  billingInformation: Record<string, unknown>;
  paymentMethod: string;
  isPaid: boolean;
  deliveryMethod: string;
  mollieOrderId?: string;
}

const orderLineSchema = new Schema(
  {
    item: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number },
    },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    orderDate: { type: Number, default: () => Date.now() },
    status: { type: String, default: 'PENDING' },
    orderLines: [orderLineSchema],
    establishmentId: { type: String, required: true },
    total: { type: Number, required: true },
    deliveryAddress: { type: Schema.Types.Mixed, default: {} },
    billingInformation: { type: Schema.Types.Mixed, default: {} },
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    deliveryMethod: { type: String, default: '' },
    mollieOrderId: { type: String, default: '' },
  },
  { timestamps: true },
);

orderSchema.index({ tenantId: 1, establishmentId: 1 });
orderSchema.index({ tenantId: 1, userId: 1 });

export const OrderModel = model<OrderDocument>('Order', orderSchema);
