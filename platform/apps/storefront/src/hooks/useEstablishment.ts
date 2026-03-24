import { useQuery } from '@tanstack/react-query'
import type { IPublicEstablishment } from '@mercashop/shared'
import { getPublicApi } from '@mercashop/shared/api-client'

async function fetchEstablishments(): Promise<IPublicEstablishment[]> {
  return getPublicApi().getPublicEstablishments()
}

export function useEstablishment() {
  const query = useQuery({
    queryKey: ['establishment'],
    queryFn: fetchEstablishments,
    select: (data) => data[0],
  })

  return {
    establishment: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
