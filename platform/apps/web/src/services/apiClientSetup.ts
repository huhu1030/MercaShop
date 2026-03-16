import {
  Configuration,
  EstablishmentApi,
  OrderApi,
  PaymentApi,
  ProductApi,
  TenantApi,
  UploadApi,
  UserApi,
} from '@mercashop/shared/api-client';
import { auth } from '../config/firebase';

const apiConfiguration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
  accessToken: async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ?? '';
  },
});

export const establishmentApi = new EstablishmentApi(apiConfiguration);
export const orderApi = new OrderApi(apiConfiguration);
export const paymentApi = new PaymentApi(apiConfiguration);
export const productApi = new ProductApi(apiConfiguration);
export const tenantApi = new TenantApi(apiConfiguration);
export const uploadApi = new UploadApi(apiConfiguration);
export const userApi = new UserApi(apiConfiguration);
