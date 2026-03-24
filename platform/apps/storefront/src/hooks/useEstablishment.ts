import { useQuery } from '@tanstack/react-query';
import { PaymentMethod, type IPublicEstablishment } from '@mercashop/shared';
import { getPublicApi } from '@mercashop/shared/api-client';

function normalizeEstablishment(establishment: IPublicEstablishment): IPublicEstablishment {
  return {
    _id: establishment._id,
    name: establishment.name,
    slug: establishment.slug,
    logo: establishment.logo,
    banner: establishment.banner,
    status: establishment.status,
    openingHours: establishment.openingHours,
    address: establishment.address,
    paymentMethods: establishment.paymentMethods.map((paymentMethod) => paymentMethod as PaymentMethod),
    description: establishment.description,
  };
}

async function fetchEstablishments(): Promise<IPublicEstablishment[]> {
  const response = await getPublicApi().getPublicEstablishments();
  const establishments = Array.isArray(response) ? response : response.data;
  return establishments.map((establishment) => normalizeEstablishment(establishment as unknown as IPublicEstablishment));
}

export function useEstablishment() {
  const query = useQuery({
    queryKey: ['establishment'],
    queryFn: fetchEstablishments,
    select: (data) => data[0],
  });

  return {
    establishment: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
