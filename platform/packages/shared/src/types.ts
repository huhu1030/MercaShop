export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IAdresse {
  rue: string;
  numero: string;
  codePostal: string;
  commune: string;
  ville: string;
  pays: string;
}

export interface IDeliveryAddress {
  street?: string;
  number?: string;
  zipCode?: string;
  city?: string;
  commune?: string;
  deliveryMethod?: string;
  comment?: string;
}

export interface IBillingInformation {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ILigneDeCommande {
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
