export enum OrderStatus {
  EN_COURS = 'EN_COURS',
  ACCEPTE = 'ACCEPTE',
  EN_PREPARATION = 'EN_PREPARATION',
  PRET = 'PRET',
  EN_LIVRAISON = 'EN_LIVRAISON',
  LIVRE = 'LIVRE',
  LIVRER = 'LIVRER',
  ANNULE = 'ANNULE',
  ANNULER = 'ANNULER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARTE = 'CARTE',
}

export enum DeliveryMethod {
  PICKUP = 'Afhalen',
  DELIVERY = 'Bezorging',
}

export enum RestaurantStatus {
  OUVERT = 'OUVERT',
  FERMER = 'FERMER',
}

export enum PictureType {
  BANNIER = 'bannier',
  LOGO = 'logo',
  PRODUCT = 'product',
}
