import { useQuery } from '@tanstack/react-query'
import type { IPublicProduct } from '@mercashop/shared'
import { getPublicApi } from '@mercashop/shared/api-client'

function normalizeProduct(product: IPublicProduct): IPublicProduct {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    photo: product.photo,
    category: product.category,
  }
}

export function useProducts(establishmentId: string | undefined) {
  const query = useQuery({
    queryKey: ['products', establishmentId],
    queryFn: async (): Promise<IPublicProduct[]> => {
      const response = await getPublicApi().getPublicProductsByEstablishment(establishmentId!)
      const products = Array.isArray(response) ? response : response.data
      return products.map((product) =>
        normalizeProduct(product as unknown as IPublicProduct),
      )
    },
    enabled: !!establishmentId,
  })

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
