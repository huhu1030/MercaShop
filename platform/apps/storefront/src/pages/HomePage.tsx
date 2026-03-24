import { Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { ProductGrid } from '../components/ProductGrid'
import { useEstablishment } from '../hooks/useEstablishment'
import { useProducts } from '../hooks/useProducts'

export function HomePage() {
  const { establishment, isLoading: establishmentLoading } = useEstablishment()
  const { products, isLoading: productsLoading } = useProducts(establishment?._id)

  if (establishmentLoading || productsLoading) {
    return (
      <VStack py={20}>
        <Spinner size="xl" />
      </VStack>
    )
  }

  return (
    <VStack gap={6} align="stretch">
      <VStack align="start" gap={2}>
        <Heading size="xl">{establishment?.name ?? 'Our Products'}</Heading>
        <Text color="fg.muted">
          {establishment?.description ?? 'Browse our products and place an order.'}
        </Text>
      </VStack>
      <ProductGrid products={products} />
    </VStack>
  )
}
