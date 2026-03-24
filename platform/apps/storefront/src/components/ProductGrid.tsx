import { SimpleGrid, Text, VStack } from '@chakra-ui/react'
import type { IPublicProduct } from '@mercashop/shared'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: IPublicProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <VStack
        py={16}
        px={6}
        borderRadius="2xl"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="blackAlpha.200"
        bg="blackAlpha.50"
      >
        <Text fontSize="lg" fontWeight="medium">
          No products available yet.
        </Text>
        <Text color="fg.muted">
          Check back shortly for the latest menu items.
        </Text>
      </VStack>
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </SimpleGrid>
  )
}
