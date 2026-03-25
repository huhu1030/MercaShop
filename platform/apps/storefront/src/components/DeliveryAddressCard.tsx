import { Button, Card, Spinner, Text, VStack } from '@chakra-ui/react';
import type { IDeliveryAddress } from '@mercashop/shared';
import { getCustomerProfileApi } from '@mercashop/shared/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { DeliveryAddressFields } from './DeliveryAddressFields';
import { toaster } from './ui/toaster.tsx';

export interface DeliveryAddressCardRef {
  trigger: () => Promise<boolean>;
  getValues: () => IDeliveryAddress;
}

interface DeliveryAddressCardProps {
  defaultValues?: IDeliveryAddress;
  required?: boolean;
  showSaveButton?: boolean;
}

export const DeliveryAddressCard = forwardRef<DeliveryAddressCardRef, DeliveryAddressCardProps>(function DeliveryAddressCard(
  { defaultValues, required = false, showSaveButton = true },
  ref,
) {
  const queryClient = useQueryClient();

  const form = useForm<IDeliveryAddress>({
    defaultValues: {
      street: defaultValues?.street ?? '',
      number: defaultValues?.number ?? '',
      zipCode: defaultValues?.zipCode ?? '',
      city: defaultValues?.city ?? '',
      municipality: defaultValues?.municipality ?? '',
      comment: defaultValues?.comment ?? '',
    },
  });

  useEffect(() => {
    if (!defaultValues) return;
    form.reset({
      street: defaultValues.street ?? '',
      number: defaultValues.number ?? '',
      zipCode: defaultValues.zipCode ?? '',
      city: defaultValues.city ?? '',
      municipality: defaultValues.municipality ?? '',
      comment: defaultValues.comment ?? '',
    });
  }, [defaultValues, form.reset]);

  useImperativeHandle(ref, () => ({
    trigger: () => form.trigger(),
    getValues: () => form.getValues(),
  }));

  const mutation = useMutation({
    mutationFn: (payload: IDeliveryAddress) => getCustomerProfileApi().updateMyProfile({ deliveryAddress: payload }),
    onSuccess: () => {
      toaster.success({ title: 'Delivery address saved' });
      return queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    },
    onError: () => {
      toaster.error({ title: 'Failed to save delivery address' });
    },
  });

  return (
    <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={5}>
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="semibold">
              Delivery Address
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Default address for your deliveries.
            </Text>
          </VStack>

          <FormProvider {...form}>
            <DeliveryAddressFields required={required} />
          </FormProvider>

          {showSaveButton && (
            <Button
              type="button"
              colorPalette="green"
              alignSelf="start"
              disabled={mutation.isPending || !form.formState.isDirty}
              onClick={async () => {
                const valid = await form.trigger();
                if (valid) mutation.mutate(form.getValues());
              }}
            >
              {mutation.isPending ? <Spinner size="sm" /> : 'Save delivery address'}
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
});
