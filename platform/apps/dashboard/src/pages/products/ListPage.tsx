import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Badge, Box, Button, Card, HStack, Image, Input, SimpleGrid, Text, VStack} from '@chakra-ui/react';
import type {ColumnDef} from '@tanstack/react-table';
import {Inbox, LayoutGrid, Rows3} from 'lucide-react';
import {LoadingScreen} from '../../components/ui/LoadingScreen.tsx';
import {DataTable} from '../../components/ui/DataTable.tsx';
import {EmptyState} from '../../components/ui/EmptyState.tsx';
import {PageHeader} from '../../components/ui/PageHeader.tsx';
import {getProductApi} from '@mercashop/shared/api-client';
import {Colors} from '../../constants/colors.ts';
import {useEstablishmentId} from '../../hooks/useEstablishmentId';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    photo?: string;
}

const columns: ColumnDef<Product, unknown>[] = [
    {
        accessorKey: 'photo',
        header: 'Picture',
        enableSorting: false,
        cell: ({row}) => (
            <Box
                overflow="hidden"
                w="3rem"
                h="3rem"
                borderRadius="md"
                bg="gray.100"
            >
                {row.original.photo ? (
                    <Image
                        src={row.original.photo}
                        alt={row.original.name}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                    />
                ) : null}
            </Box>
        ),
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({getValue}) => <Text fontWeight="medium">{getValue<string>()}</Text>,
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'price',
        header: 'Price',
        meta: {align: 'right'},
        cell: ({getValue}) => `€${getValue<number>().toFixed(2)}`,
    },
    {
        accessorKey: 'quantity',
        header: 'Qty',
        meta: {align: 'right'},
    },
];

export function ListPage() {
    const {establishmentId} = useEstablishmentId()!;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [view, setView] = useState<'table' | 'grid'>('table');
    const {data, isLoading} = useQuery({
        queryKey: ['products', establishmentId],
        queryFn: () => getProductApi().getProductsByEstablishment(establishmentId),
    });

    if (isLoading) return <LoadingScreen/>;

    const products = (data?.data?.products ?? []) as Product[];
    const categories = ['All', ...new Set(products.map((product) => product.category).filter(Boolean))];
    const normalizedSearch = search.trim().toLowerCase();
    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = !normalizedSearch
            || product.name.toLowerCase().includes(normalizedSearch)
            || product.category.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
    });

    return (
        <VStack gap="1.25rem" align="stretch">
            <PageHeader
                breadcrumbs={[{label: 'Products'}]}
                title="Products"
                description="View and manage your product catalog."
            />

            <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name or category"
                maxW="24rem"
            />

            <HStack justify="space-between" align={{base: 'stretch', md: 'center'}} flexDirection={{base: 'column', md: 'row'}}>
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

                <HStack gap="0.5rem" alignSelf={{base: 'flex-start', md: 'auto'}}>
                    <Button
                        size="sm"
                        variant={view === 'table' ? 'solid' : 'outline'}
                        colorPalette={view === 'table' ? 'purple' : 'gray'}
                        onClick={() => setView('table')}
                    >
                        <Rows3 size="1rem"/>
                        Table
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'grid' ? 'solid' : 'outline'}
                        colorPalette={view === 'grid' ? 'purple' : 'gray'}
                        onClick={() => setView('grid')}
                    >
                        <LayoutGrid size="1rem"/>
                        Grid
                    </Button>
                </HStack>
            </HStack>

            {view === 'table' ? (
                <DataTable
                    columns={columns}
                    data={filteredProducts}
                    emptyTitle="No products yet"
                    emptyDescription={normalizedSearch || selectedCategory !== 'All'
                        ? 'No products match your filters.'
                        : 'Add your first product to get started.'}
                />
            ) : filteredProducts.length === 0 ? (
                <EmptyState
                    icon={<Inbox size="2.5rem" color={Colors.text.muted}/>}
                    title="No products yet"
                    description={normalizedSearch || selectedCategory !== 'All'
                        ? 'No products match your filters.'
                        : 'Add your first product to get started.'}
                />
            ) : (
                <SimpleGrid columns={{base: 1, md: 2, xl: 3}} gap="1rem">
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
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>
            )}
        </VStack>
    );
}
