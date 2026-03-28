import type { IOrderLine } from '@mercashop/shared';
import { PaymentMethod } from '@mercashop/shared';

export interface CreateOrderBody {
  /** @minLength 1 */
  establishmentId: string;
  orderLines: IOrderLine[];
  deliveryAddress?: Record<string, unknown>;
  billingInformation?: Record<string, unknown>;
  paymentMethod: PaymentMethod;
  deliveryMethod?: string;
  /** @maxLength 200 */
  remark?: string;
}

export interface UpdateOrderStatusBody {
  status: string;
}
