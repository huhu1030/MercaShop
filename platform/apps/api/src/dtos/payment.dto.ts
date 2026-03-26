import { PaymentMethod } from '@mercashop/shared';

export interface ProcessPaymentBody {
  orderId: string;
  paymentMethod: PaymentMethod;
}

export interface MollieWebhookBody {
  id: string;
}
