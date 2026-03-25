import { Box, Text, VStack } from '@chakra-ui/react';
import type { IPublicProduct } from '@mercashop/shared';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: IPublicProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
  disabled?: boolean;
}

export function ProductGrid({
  products,
  emptyTitle = 'No products available yet.',
  emptyDescription = 'Check back shortly for the latest menu items.',
  disabled,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <VStack py={16} px={6} borderRadius="2xl" borderWidth="1px" borderStyle="dashed" borderColor="blackAlpha.200" bg="blackAlpha.50">
        <Text fontSize="lg" fontWeight="medium">
          {emptyTitle}
        </Text>
        <Text color="fg.muted">{emptyDescription}</Text>
      </VStack>
    );
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: '1fr',
        sm: 'repeat(auto-fill, minmax(260px, 1fr))',
      }}
      gap={6}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} disabled={disabled} />
      ))}
    </Box>
  );
}
