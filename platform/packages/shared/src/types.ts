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
  deliveryMethod?: string;
  comment?: string;
}

export interface IBillingInformation {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface IOrderLine {
  item: {
    _id: string;
    name: string;
    amount: number;
    price?: number;
  };
}

export interface ITenantBranding {
  logo: string;
  primaryColor: string;
  appName: string;
}

export interface ITenantConfig {
  id: string;
  name: string;
  branding: ITenantBranding;
}
