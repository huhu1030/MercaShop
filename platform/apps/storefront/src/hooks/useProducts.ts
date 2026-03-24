import { useQuery } from '@tanstack/react-query'
import type { IPublicProduct } from '@mercashop/shared'
import { getPublicApi } from '@mercashop/shared/api-client'

export function useProducts(establishmentId: string | undefined) {
  const query = useQuery({
    queryKey: ['products', establishmentId],
    queryFn: (): Promise<IPublicProduct[]> =>
      getPublicApi().getPublicProductsByEstablishment(establishmentId!),
    enabled: !!establishmentId,
  })

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
