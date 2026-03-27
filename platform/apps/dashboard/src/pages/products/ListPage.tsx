import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Box, Button, Card, CloseButton, HStack, Image, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Inbox, LayoutGrid, Pencil, Rows3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../../components/ui/LoadingScreen.tsx';
import { DataTable } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { PageHeader } from '../../components/ui/PageHeader.tsx';
import { getProductApi } from '@mercashop/shared/api-client';
import { Colors } from '../../constants/colors.ts';
import { useEstablishmentId } from '../../hooks/useEstablishmentId';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  photo?: string;
  optionGroups?: Array<{ name: string }>;
}

export function ListPage() {
  const { establishmentId } = useEstablishmentId()!;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['products', establishmentId],
    queryFn: () => getProductApi().getProductsByEstablishment(establishmentId),
  });

  const products = (data?.data?.products ?? []) as Product[];
  const categories = ['All', ...new Set(products.map((product) => product.category).filter(Boolean))];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch) || product.category.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: 'photo',
      header: 'Picture',
      enableSorting: false,
      cell: ({ row }) => (
        <Box
          overflow="hidden"
          w="7rem"
          h="7rem"
          borderRadius="md"
          bg="gray.100"
          cursor={row.original.photo ? 'zoom-in' : 'default'}
          onClick={() => (row.original.photo ? setSelectedImage({ src: row.original.photo, alt: row.original.name }) : undefined)}
        >
          {row.original.photo ? <Image src={row.original.photo} alt={row.original.name} w="100%" h="100%" objectFit="cover" /> : null}
        </Box>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => <Text fontWeight="medium">{getValue<string>()}</Text>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: { align: 'right' },
      cell: ({ getValue }) => `€${getValue<number>().toFixed(2)}`,
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      meta: { align: 'right' },
    },
    {
      id: 'options',
      header: 'Options',
      cell: ({ row }) => {
        const count = row.original.optionGroups?.length ?? 0;
        return count > 0 ? (
          <Badge colorPalette="purple" size="sm">
            {count} {count === 1 ? 'group' : 'groups'}
          </Badge>
        ) : (
          <Text color="fg.muted" fontSize="sm">—</Text>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/establishments/${establishmentId}/products/${row.original._id}/edit`)}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil size="1rem" />
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingScreen />;
  return (
    <VStack gap="1.25rem" align="stretch">
      <PageHeader breadcrumbs={[{ label: 'Products' }]} title="Products" description="View and manage your product catalog." />

      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products by name or category" maxW="24rem" />

      <HStack justify="space-between" align={{ base: 'stretch', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }}>
        <HStack gap="0.75rem" overflowX="auto" pb="0.25rem">
          {categories.map((category) => {
            const active = category === selectedCategory;

            return (
              <Button
                key={category}
                size="sm"
                variant={active ? 'solid' : 'outline'}
                colorPalette={active ? 'purple' : 'gray'}
                onClick={() => setSelectedCategory(category)}
                flexShrink={0}
              >
                {category}
              </Button>
            );
          })}
        </HStack>

        <HStack gap="0.5rem" alignSelf={{ base: 'flex-start', md: 'auto' }}>
          <Button
            size="sm"
            variant={view === 'table' ? 'solid' : 'outline'}
            colorPalette={view === 'table' ? 'purple' : 'gray'}
            onClick={() => setView('table')}
          >
            <Rows3 size="1rem" />
            Table
          </Button>
          <Button
            size="sm"
            variant={view === 'grid' ? 'solid' : 'outline'}
            colorPalette={view === 'grid' ? 'purple' : 'gray'}
            onClick={() => setView('grid')}
          >
            <LayoutGrid size="1rem" />
            Grid
          </Button>
        </HStack>
      </HStack>

      {view === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredProducts}
          emptyTitle="No products yet"
          emptyDescription={
            normalizedSearch || selectedCategory !== 'All' ? 'No products match your filters.' : 'Add your first product to get started.'
          }
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Inbox size="2.5rem" color={Colors.text.muted} />}
          title="No products yet"
          description={normalizedSearch || selectedCategory !== 'All' ? 'No products match your filters.' : 'Add your first product to get started.'}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="1rem">
          {filteredProducts.map((product) => (
            <Card.Root key={product._id} variant="outline" overflow="hidden">
              <Box h="12rem" bg="gray.100">
                {product.photo ? (
                  <Image
                    src={product.photo}
                    alt={product.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    cursor="zoom-in"
                    onClick={() => setSelectedImage({ src: product.photo!, alt: product.name })}
                  />
                ) : null}
              </Box>
              <Card.Body>
                <VStack align="stretch" gap="0.75rem">
                  <HStack justify="space-between" align="start">
                    <Text fontWeight="semibold" fontSize="lg">
                      {product.name}
                    </Text>
                    <Badge colorPalette="purple">{product.category}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={Colors.text.secondary}>Price</Text>
                    <Text fontWeight="medium">€{product.price.toFixed(2)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={Colors.text.secondary}>Quantity</Text>
                    <Text fontWeight="medium">{product.quantity}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={Colors.text.secondary}>Options</Text>
                    {(product.optionGroups?.length ?? 0) > 0 ? (
                      <Badge colorPalette="purple" size="sm">
                        {product.optionGroups!.length} {product.optionGroups!.length === 1 ? 'group' : 'groups'}
                      </Badge>
                    ) : (
                      <Text color="fg.muted" fontSize="sm">—</Text>
                    )}
                  </HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/establishments/${establishmentId}/products/${product._id}/edit`)}
                  >
                    <Pencil size="1rem" />
                    Edit
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

      {selectedImage ? (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.800"
          zIndex={1400}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{ base: '1rem', md: '2rem' }}
          onClick={() => setSelectedImage(null)}
        >
          <CloseButton
            position="absolute"
            top="1rem"
            right="1rem"
            size="lg"
            color="white"
            bg="blackAlpha.600"
            _hover={{ bg: 'blackAlpha.700' }}
            onClick={() => setSelectedImage(null)}
          />
          <Box maxW="min(90vw, 1200px)" maxH="90vh" onClick={(event) => event.stopPropagation()}>
            <Image src={selectedImage.src} alt={selectedImage.alt} maxW="100%" maxH="90vh" objectFit="contain" borderRadius="md" boxShadow="2xl" />
          </Box>
        </Box>
      ) : null}
    </VStack>
  );
}
