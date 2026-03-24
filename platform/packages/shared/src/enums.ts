export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANCONTACT = 'BANCONTACT',
}

export enum DeliveryMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export enum EstablishmentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum PictureType {
  BANNER = 'BANNER',
  LOGO = 'LOGO',
  PRODUCT = 'PRODUCT',
}
