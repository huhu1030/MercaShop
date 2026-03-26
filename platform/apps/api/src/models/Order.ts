import { Schema, model, Document } from 'mongoose';
import { PaymentMethod } from '../types/order';

export interface OrderDocument extends Document {
  tenantId: string;
  userId: string;
  orderDate: number;
  status: string;
  orderLines: Array<{
    item: {
      _id: string;
      name: string;
      quantity: number;
      price?: number;
      selectedOptions?: Array<{
        name: string;
        choices: Array<{ name: string; quantity: number; extraPrice: number }>;
      }>;
      optionsTotalPrice?: number;
    };
  }>;
  establishmentId: string;
  total: number;
  deliveryAddress: Record<string, unknown>;
  billingInformation: Record<string, unknown>;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  deliveryMethod: string;
  mollieOrderId?: string;
  remark?: string;
}

const selectedChoiceSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    extraPrice: { type: Number, required: true },
  },
  { _id: false },
);

const selectedOptionGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    choices: { type: [selectedChoiceSchema], required: true },
  },
  { _id: false },
);

const orderLineSchema = new Schema(
  {
    item: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number },
      selectedOptions: { type: [selectedOptionGroupSchema], default: undefined },
      optionsTotalPrice: { type: Number },
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
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    isPaid: { type: Boolean, default: false },
    deliveryMethod: { type: String, default: '' },
    mollieOrderId: { type: String, default: '' },
    remark: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);

orderSchema.index({ tenantId: 1, establishmentId: 1 });
orderSchema.index({ tenantId: 1, userId: 1 });
orderSchema.index({ tenantId: 1, establishmentId: 1, orderDate: 1 });

export const OrderModel = model<OrderDocument>('Order', orderSchema);
