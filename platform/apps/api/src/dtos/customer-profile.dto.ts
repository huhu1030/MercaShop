import type { IBillingInformation, IDeliveryAddress } from '@mercashop/shared';

export interface UpdateCustomerProfileBody {
  billingInformation?: IBillingInformation;
  deliveryAddress?: IDeliveryAddress;
}
