import { Box, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { ProductGrid } from '../components/ProductGrid';
import { useEstablishment } from '../hooks/useEstablishment';
import { useProducts } from '../hooks/useProducts';

export function HomePage() {
  const { establishment, isLoading: establishmentLoading } = useEstablishment();
  const { products, isLoading: productsLoading } = useProducts(establishment?._id);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category?.trim()).filter((category): category is string => !!category))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === null) {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  if (establishmentLoading || productsLoading) {
    return (
      <VStack py={20} h="full" justify="center">
        <Spinner size="xl" />
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch" h="full" minH={0}>
      <VStack align="start" gap={2}>
        <Heading size="xl">{establishment?.name ?? 'Our Products'}</Heading>
        <Text color="fg.muted">{establishment?.description ?? 'Browse our products and place an order.'}</Text>
      </VStack>
      <CategoryFilterBar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <Box flex="1" minH={0} overflowY="auto" pr={{ base: 1, md: 2 }}>
        <ProductGrid
          products={filteredProducts}
          emptyTitle={selectedCategory ? `No products in ${selectedCategory}.` : undefined}
          emptyDescription={selectedCategory ? 'Try another category or switch back to all products.' : undefined}
        />
      </Box>
    </VStack>
  );
}
