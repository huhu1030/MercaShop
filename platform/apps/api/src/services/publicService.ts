import { EstablishmentModel } from '../models';
import { ProductModel } from '../models';
import { IPublicEstablishment, IPublicProduct } from '@mercashop/shared';

const PUBLIC_ESTABLISHMENT_FIELDS = '_id name slug logo banner status openingHours address paymentMethods description';
const PUBLIC_PRODUCT_FIELDS = '_id name description price photo category optionGroups';

async function getEstablishments(tenantId: string): Promise<IPublicEstablishment[]> {
  return EstablishmentModel.find({ tenantId }).select(PUBLIC_ESTABLISHMENT_FIELDS).lean<IPublicEstablishment[]>();
}

async function getProductsByEstablishment(tenantId: string, establishmentId: string): Promise<IPublicProduct[]> {
  return ProductModel.find({ tenantId, establishmentId }).select(PUBLIC_PRODUCT_FIELDS).lean<IPublicProduct[]>();
}

export const publicService = {
  getEstablishments,
  getProductsByEstablishment,
};
