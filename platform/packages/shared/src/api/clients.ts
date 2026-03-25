import type { AxiosInstance } from 'axios';
import type { Configuration } from '../apis/api/configuration';
import { AnalyticsApi, CustomerProfileApi, EstablishmentApi, OrderApi, PaymentApi, ProductApi, PublicApi, TenantApi, UploadApi, UserApi, WebhookApi } from '../apis/api/api';
import { createApiConfiguration, getApiAxiosInstance } from './api-client-factory';

let analyticsApi: AnalyticsApi | null = null;
let customerProfileApi: CustomerProfileApi | null = null;
let establishmentApi: EstablishmentApi | null = null;
let orderApi: OrderApi | null = null;
let paymentApi: PaymentApi | null = null;
let productApi: ProductApi | null = null;
let tenantApi: TenantApi | null = null;
let uploadApi: UploadApi | null = null;
let userApi: UserApi | null = null;
let publicApi: PublicApi | null = null;
let webhookApi: WebhookApi | null = null;

type ApiConstructor<T> = new (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

function createInstance<T>(ApiClass: ApiConstructor<T>): T {
  const config = createApiConfiguration();
  const axiosInstance = getApiAxiosInstance();
  return new ApiClass(config, undefined, axiosInstance);
}

export function getAnalyticsApi(): AnalyticsApi {
  if (!analyticsApi) analyticsApi = createInstance(AnalyticsApi);
  return analyticsApi;
}

export function getCustomerProfileApi(): CustomerProfileApi {
  if (!customerProfileApi) customerProfileApi = createInstance(CustomerProfileApi);
  return customerProfileApi;
}

export function getEstablishmentApi(): EstablishmentApi {
  if (!establishmentApi) establishmentApi = createInstance(EstablishmentApi);
  return establishmentApi;
}

export function getOrderApi(): OrderApi {
  if (!orderApi) orderApi = createInstance(OrderApi);
  return orderApi;
}

export function getPaymentApi(): PaymentApi {
  if (!paymentApi) paymentApi = createInstance(PaymentApi);
  return paymentApi;
}

export function getProductApi(): ProductApi {
  if (!productApi) productApi = createInstance(ProductApi);
  return productApi;
}

export function getTenantApi(): TenantApi {
  if (!tenantApi) tenantApi = createInstance(TenantApi);
  return tenantApi;
}

export function getUploadApi(): UploadApi {
  if (!uploadApi) uploadApi = createInstance(UploadApi);
  return uploadApi;
}

export function getUserApi(): UserApi {
  if (!userApi) userApi = createInstance(UserApi);
  return userApi;
}

export function getPublicApi(): PublicApi {
  if (!publicApi) publicApi = createInstance(PublicApi);
  return publicApi;
}

export function getWebhookApi(): WebhookApi {
  if (!webhookApi) webhookApi = createInstance(WebhookApi);
  return webhookApi;
}

export function resetApiClients(): void {
  analyticsApi = null;
  customerProfileApi = null;
  establishmentApi = null;
  orderApi = null;
  paymentApi = null;
  productApi = null;
  tenantApi = null;
  uploadApi = null;
  userApi = null;
  publicApi = null;
  webhookApi = null;
}
