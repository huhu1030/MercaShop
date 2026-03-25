// Re-export everything from the generated API client
export * from '../apis/api';

// Centralized API client factory
export { initApiClient, getApiAxiosInstance, createApiConfiguration } from './api-client-factory';
export {
  getAnalyticsApi,
  getCustomerProfileApi,
  getEstablishmentApi,
  getOrderApi,
  getPaymentApi,
  getProductApi,
  getPublicApi,
  getTenantApi,
  getUploadApi,
  getUserApi,
  getWebhookApi,
  resetApiClients,
} from './clients';
