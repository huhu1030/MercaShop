import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Box, Button, Field, Input, Text, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductApi } from '@mercashop/shared/api-client';
import type { IOptionGroup } from '@mercashop/shared';
import { PageHeader } from '../../components/ui/PageHeader.tsx';
import { Colors } from '../../constants/colors.ts';
import { useEstablishmentId } from '../../hooks/useEstablishmentId';
import { LoadingScreen } from '../../components/ui/LoadingScreen.tsx';
import { OptionGroupDrawer } from '../../components/products/OptionGroupDrawer';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  quantity: z.coerce.number().int().min(0).optional(),
  location: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function EditPage() {
  const { establishmentId } = useEstablishmentId()!;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [optionGroups, setOptionGroups] = useState<IOptionGroup[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductApi().getProduct(id!),
    enabled: Boolean(id),
  });

  const product = data?.data?.product;

  useEffect(() => {
    if (!product) return;

    reset({
      name: product.name ?? '',
      category: product.category ?? '',
      price: product.price ?? 0,
      quantity: product.quantity ?? undefined,
      location: product.location ?? '',
    });
    setOptionGroups(product.optionGroups ?? []);
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      getProductApi().updateProduct(id!, {
        ...values,
        ...(optionGroups.length > 0 ? { optionGroups } : { optionGroups: [] }),
      }),
    onSuccess: () => {
      navigate(`/establishments/${establishmentId}/products`);
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <VStack gap="1.25rem" align="stretch" maxW="31.25rem">
      <PageHeader
        breadcrumbs={[
          { label: 'Products', path: `/establishments/${establishmentId}/products` },
          { label: 'Edit Product' },
        ]}
        title="Edit Product"
        description="Update product details and options."
      />

      {mutation.isSuccess && (
        <Box p="0.75rem" bg={Colors.feedback.successBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.successBorder}>
          <Text color={Colors.feedback.successText} fontSize="sm">
            Product updated successfully.
          </Text>
        </Box>
      )}

      {mutation.isError && (
        <Box p="0.75rem" bg={Colors.feedback.errorBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.errorBorder}>
          <Text color={Colors.feedback.errorText} fontSize="sm">
            Failed to update product. Please try again.
          </Text>
        </Box>
      )}

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="1rem" align="stretch">
          <Field.Root required invalid={Boolean(errors.name)}>
            <Field.Label>Product Name</Field.Label>
            <Input placeholder="e.g. Margherita Pizza" {...register('name')} />
            {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
          </Field.Root>

          <Field.Root required invalid={Boolean(errors.category)}>
            <Field.Label>Category</Field.Label>
            <Input placeholder="e.g. Pizza, Drinks" {...register('category')} />
            {errors.category && <Field.ErrorText>{errors.category.message}</Field.ErrorText>}
          </Field.Root>

          <Field.Root required invalid={Boolean(errors.price)}>
            <Field.Label>Price (&euro;)</Field.Label>
            <Input type="number" step="0.01" min="0" placeholder="0.00" {...register('price')} />
            {errors.price && <Field.ErrorText>{errors.price.message}</Field.ErrorText>}
          </Field.Root>

          <Field.Root invalid={Boolean(errors.quantity)}>
            <Field.Label>Quantity</Field.Label>
            <Input type="number" min="0" placeholder="0" {...register('quantity')} />
            {errors.quantity && <Field.ErrorText>{errors.quantity.message}</Field.ErrorText>}
          </Field.Root>

          <Field.Root invalid={Boolean(errors.location)}>
            <Field.Label>Location</Field.Label>
            <Input placeholder="e.g. 41B" {...register('location')} />
            {errors.location && <Field.ErrorText>{errors.location.message}</Field.ErrorText>}
          </Field.Root>

          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Manage Options ({optionGroups.length} groups)
          </Button>

          <Button type="submit" colorPalette="purple" loading={mutation.isPending} loadingText="Saving...">
            Save Changes
          </Button>
        </VStack>
      </Box>

      <OptionGroupDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        optionGroups={optionGroups}
        onChange={setOptionGroups}
      />
    </VStack>
  );
}
