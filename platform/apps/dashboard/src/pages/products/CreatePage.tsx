import {useMutation} from '@tanstack/react-query';
import {Box, Button, Field, Input, Text, VStack,} from '@chakra-ui/react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {getProductApi} from '@mercashop/shared/api-client';
import {PageHeader} from '../../components/ui/PageHeader.tsx';
import {Colors} from '../../constants/colors.ts';
import {useEstablishmentId} from '../../hooks/useEstablishmentId';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    quantity: z.coerce.number().int().min(0).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function CreatePage() {
    const {establishmentId} = useEstablishmentId()!;
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: '',
            price: 0,
            quantity: undefined,
        },
    });

    const mutation = useMutation({
        mutationFn: (values: ProductFormValues) =>
            getProductApi().createProduct({
                ...values,
                establishmentId,
            }),
        onSuccess: () => {
            reset();
        },
    });

    const onSubmit = (values: ProductFormValues) => {
        mutation.mutate(values);
    };

    return (
        <VStack gap="1.25rem" align="stretch" maxW="31.25rem">
            <PageHeader
                breadcrumbs={[
                    {label: 'Products', path: `/establishments/${establishmentId}/products`},
                    {label: 'Add Product'},
                ]}
                title="Add Product"
                description="Add a new product to your catalog."
            />

            {mutation.isSuccess && (
                <Box p="0.75rem" bg={Colors.feedback.successBg} borderRadius="md" borderLeft="0.25rem solid"
                     borderColor={Colors.feedback.successBorder}>
                    <Text color={Colors.feedback.successText} fontSize="sm">Product created successfully.</Text>
                </Box>
            )}

            {mutation.isError && (
                <Box p="0.75rem" bg={Colors.feedback.errorBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.errorBorder}>
                    <Text color={Colors.feedback.errorText} fontSize="sm">Failed to create product. Please try again.</Text>
                </Box>
            )}

            <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="1rem" align="stretch">
                    <Field.Root required invalid={!!errors.name}>
                        <Field.Label>Product Name</Field.Label>
                        <Input
                            placeholder="e.g. Margherita Pizza"
                            {...register('name')}
                        />
                        {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                    </Field.Root>

                    <Field.Root required invalid={!!errors.category}>
                        <Field.Label>Category</Field.Label>
                        <Input
                            placeholder="e.g. Pizza, Drinks"
                            {...register('category')}
                        />
                        {errors.category && <Field.ErrorText>{errors.category.message}</Field.ErrorText>}
                    </Field.Root>

                    <Field.Root required invalid={!!errors.price}>
                        <Field.Label>Price (&euro;)</Field.Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register('price')}
                        />
                        {errors.price && <Field.ErrorText>{errors.price.message}</Field.ErrorText>}
                    </Field.Root>

                    <Field.Root invalid={!!errors.quantity}>
                        <Field.Label>Quantity</Field.Label>
                        <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register('quantity')}
                        />
                        {errors.quantity && <Field.ErrorText>{errors.quantity.message}</Field.ErrorText>}
                    </Field.Root>

                    <Button
                        type="submit"
                        colorPalette="purple"
                        loading={mutation.isPending}
                        loadingText="Creating..."
                    >
                        Add Product
                    </Button>
                </VStack>
            </Box>
        </VStack>
    );
}
