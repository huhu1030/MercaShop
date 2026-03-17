import {useQuery} from '@tanstack/react-query';
import {Heading, Text, VStack} from '@chakra-ui/react';
import type {ColumnDef} from '@tanstack/react-table';
import {LoadingScreen} from '../../components/ui/LoadingScreen.tsx';
import {DataTable} from '../../components/ui/DataTable.tsx';
import {getProductApi} from '@mercashop/shared/api-client';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

const columns: ColumnDef<Product, unknown>[] = [
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
    const establishmentId = ''; // TODO: get from tenant/establishment context
    const {data, isLoading} = useQuery({
        queryKey: ['products', establishmentId],
        queryFn: () => getProductApi().getProductsByEstablishment(establishmentId),
        enabled: !!establishmentId,
    });

    if (isLoading) return <LoadingScreen/>;

    const products = (data?.data?.products ?? []) as Product[];

    return (
        <VStack gap="1.25rem" align="stretch">
            <Heading size="lg">Products</Heading>

            <DataTable
                columns={columns}
                data={products}
                emptyTitle="No products yet"
                emptyDescription="Add your first product to get started."
            />
        </VStack>
    );
}
