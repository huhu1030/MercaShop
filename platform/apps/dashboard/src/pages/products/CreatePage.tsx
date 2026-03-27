import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, Field, FileUpload, Grid, Input, Text, VStack } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProductApi, getUploadApi } from '@mercashop/shared/api-client';
import type { IOptionGroup } from '@mercashop/shared';
import { PageHeader } from '../../components/ui/PageHeader.tsx';
import { Colors } from '../../constants/colors.ts';
import { useEstablishmentId } from '../../hooks/useEstablishmentId';
import { Upload, X } from 'lucide-react';
import { OptionGroupPanel } from '../../components/products/OptionGroupPanel';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  quantity: z.coerce.number().int().min(0).optional(),
  location: z.string().optional(),
  picture: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File)
    .refine((value) => value instanceof File, { message: 'Picture is required' }),
});

type ProductFormValues = z.input<typeof productSchema>;

export function CreatePage() {
  const { establishmentId } = useEstablishmentId()!;
  const [optionGroups, setOptionGroups] = useState<IOptionGroup[]>([]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      quantity: undefined,
      location: '',
      picture: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { picture, ...productValues } = values;
      if (!picture) {
        throw new Error('Picture is required');
      }

      const createResponse = await getProductApi().createProduct({
        ...productValues,
        establishmentId,
        ...(optionGroups.length > 0 ? { optionGroups } : {}),
      });

      const productId = createResponse.data.product?._id as string | undefined;
      if (!productId) {
        throw new Error('Product creation did not return an id');
      }

      try {
        await getUploadApi().uploadProductImage(productId, picture);
      } catch (error) {
        await getProductApi()
          .deleteProduct(productId)
          .catch(() => undefined);
        throw error;
      }

      return createResponse;
    },
    onSuccess: () => {
      reset();
      setOptionGroups([]);
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  return (
    <VStack gap="1.25rem" align="stretch">
      <PageHeader
        breadcrumbs={[{ label: 'Products', path: `/establishments/${establishmentId}/products` }, { label: 'Add Product' }]}
        title="Add Product"
        description="Add a new product to your catalog."
      />

      {mutation.isSuccess && (
        <Box p="0.75rem" bg={Colors.feedback.successBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.successBorder}>
          <Text color={Colors.feedback.successText} fontSize="sm">
            Product created successfully.
          </Text>
        </Box>
      )}

      {mutation.isError && (
        <Box p="0.75rem" bg={Colors.feedback.errorBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.errorBorder}>
          <Text color={Colors.feedback.errorText} fontSize="sm">
            Failed to create product. Please try again.
          </Text>
        </Box>
      )}

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="2rem" alignItems="start">
        {/* Left column — Product details */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="1rem" align="stretch">
            <Text fontWeight="semibold" fontSize="lg">
              Product Details
            </Text>

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

            <Controller
              name="picture"
              control={control}
              render={({ field }) => (
                <Field.Root required invalid={Boolean(errors.picture)}>
                  <Field.Label>Picture</Field.Label>
                  <FileUpload.Root
                    maxFiles={1}
                    accept={['image/*']}
                    invalid={Boolean(errors.picture)}
                    acceptedFiles={field.value ? [field.value] : []}
                    onFileChange={({ acceptedFiles }) => {
                      const file = acceptedFiles[0];
                      if (file) {
                        field.onChange(file);
                        return;
                      }

                      resetField('picture', { defaultValue: undefined });
                    }}
                  >
                    <FileUpload.HiddenInput />
                    <FileUpload.Dropzone
                      w="full"
                      minH="11rem"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={errors.picture ? Colors.feedback.errorBorder : 'gray.300'}
                      borderRadius="xl"
                      bg="gray.50"
                    >
                      <FileUpload.DropzoneContent>
                        <VStack gap="0.75rem" py="1.5rem" px="1rem" textAlign="center">
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            boxSize="3rem"
                            borderRadius="full"
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray.200"
                          >
                            <Upload size="1.25rem" />
                          </Box>
                          <VStack gap="0.25rem">
                            <Text fontWeight="semibold">Drop product picture here</Text>
                            <Text fontSize="sm" color={Colors.text.muted}>
                              Drag and drop an image, or click to browse.
                            </Text>
                          </VStack>
                        </VStack>
                      </FileUpload.DropzoneContent>
                    </FileUpload.Dropzone>

                    {field.value && (
                      <FileUpload.ItemGroup
                        mt="0.75rem"
                        w="full"
                        gap="0.75rem"
                        display="flex"
                        flexDirection="column"
                        alignItems="stretch"
                        listStyleType="none"
                        p="0"
                        m="0"
                      >
                        <FileUpload.Item file={field.value} p="0.75rem" borderWidth="1px" borderRadius="lg" alignItems="center" gap="0.75rem">
                          <FileUpload.ItemPreview boxSize="4rem" overflow="hidden" borderRadius="md" bg="gray.100">
                            <FileUpload.ItemPreviewImage w="100%" h="100%" objectFit="cover" />
                          </FileUpload.ItemPreview>
                          <FileUpload.ItemContent>
                            <FileUpload.ItemName fontWeight="medium" />
                            <FileUpload.ItemSizeText color={Colors.text.muted} fontSize="sm" />
                          </FileUpload.ItemContent>
                          <FileUpload.ItemDeleteTrigger
                            type="button"
                            aria-label={`Remove ${field.value.name}`}
                            onClick={() => resetField('picture', { defaultValue: undefined })}
                          >
                            <X size="1rem" />
                          </FileUpload.ItemDeleteTrigger>
                        </FileUpload.Item>
                      </FileUpload.ItemGroup>
                    )}
                  </FileUpload.Root>
                  {errors.picture && <Field.ErrorText>{errors.picture.message}</Field.ErrorText>}
                </Field.Root>
              )}
            />

            <Button type="submit" colorPalette="purple" loading={mutation.isPending} loadingText="Creating...">
              Add Product
            </Button>
          </VStack>
        </Box>

        {/* Right column — Option groups */}
        <Box
          position={{ lg: 'sticky' }}
          top={{ lg: '1rem' }}
          borderWidth={{ lg: '1px' }}
          borderRadius={{ lg: 'xl' }}
          p={{ lg: '1.25rem' }}
          bg={{ lg: 'gray.50' }}
        >
          <OptionGroupPanel optionGroups={optionGroups} onChange={setOptionGroups} />
        </Box>
      </Grid>
    </VStack>
  );
}
