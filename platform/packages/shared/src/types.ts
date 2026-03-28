import { PaymentMethod, EstablishmentStatus } from './enums';

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IAddress {
  street: string;
  number: string;
  zipCode: string;
  municipality: string;
  city: string;
  country: string;
}

export interface IDeliveryAddress {
  street?: string;
  number?: string;
  zipCode?: string;
  city?: string;
  municipality?: string;
  comment?: string;
}

export interface IBillingInformation {
  name?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
}

export interface ICustomerProfile {
  billingInformation: IBillingInformation;
  deliveryAddress: IDeliveryAddress;
}

export interface IOrderLine {
  item: {
    _id: string;
    name: string;
    quantity: number;
    price?: number;
    selectedOptions?: ISelectedOptionGroup[];
    optionsTotalPrice?: number;
  };
}

export interface ITenantBranding {
  logo: string;
  primaryColor: string;
  appName: string;
  favicon?: string;
}

export interface ITenantConfig {
  id: string;
  name: string;
  branding: ITenantBranding;
  identityPlatformTenantId: string;
}

export interface ITenantAuthConfig {
  identityPlatformTenantId: string;
}

export interface IEstablishmentSummary {
  _id: string;
  name: string;
  category: string;
  status: EstablishmentStatus;
  logo: string;
}

export interface IPublicEstablishment {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  banner?: string;
  status: EstablishmentStatus;
  openingHours?: string;
  address: IAddress;
  paymentMethods: PaymentMethod[];
  description?: string;
}

export interface IOptionChoice {
  name: string;
  extraPrice: number;
  maxQuantity: number;
}

export type SelectionMode = 'exactlyOne' | 'upToN' | 'anyNumber';

export interface IOptionGroup {
  name: string;
  required: boolean;
  selectionMode: SelectionMode;
  maxSelections?: number;
  choices: IOptionChoice[];
}

export interface ISelectedChoice {
  name: string;
  quantity: number;
  extraPrice: number;
}

export interface ISelectedOptionGroup {
  name: string;
  choices: ISelectedChoice[];
}

export interface IPublicProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  photo?: string;
  category: string;
  optionGroups: IOptionGroup[];
}

export interface IMonthlyMetric {
  month: number;
  orderCount: number;
  revenue: number;
}

export interface IProductSales {
  productName: string;
  quantitySold: number;
}

export interface IAnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface IAnalyticsResponse {
  summary: IAnalyticsSummary;
  monthly: IMonthlyMetric[];
  bestSellers: IProductSales[];
  leastSellers: IProductSales[];
}
