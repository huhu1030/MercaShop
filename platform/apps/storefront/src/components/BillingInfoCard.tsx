import { Button, Card, Spinner, Text, VStack } from '@chakra-ui/react';
import type { IBillingInformation } from '@mercashop/shared';
import { getCustomerProfileApi } from '@mercashop/shared/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BillingInfoFields } from './BillingInfoFields';
import { toaster } from './ui/toaster.tsx';

export interface BillingInfoCardRef {
  trigger: () => Promise<boolean>;
  getValues: () => IBillingInformation;
}

interface BillingInfoCardProps {
  defaultValues?: IBillingInformation;
  required?: boolean;
  showSaveButton?: boolean;
}

export const BillingInfoCard = forwardRef<BillingInfoCardRef, BillingInfoCardProps>(function BillingInfoCard(
  { defaultValues, required = false, showSaveButton = true },
  ref,
) {
  const queryClient = useQueryClient();

  const form = useForm<IBillingInformation>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      vatNumber: defaultValues?.vatNumber ?? '',
    },
  });

  useEffect(() => {
    if (!defaultValues) return;
    form.reset({
      name: defaultValues.name ?? '',
      email: defaultValues.email ?? '',
      phone: defaultValues.phone ?? '',
      vatNumber: defaultValues.vatNumber ?? '',
    });
  }, [defaultValues, form.reset]);

  useImperativeHandle(ref, () => ({
    trigger: () => form.trigger(),
    getValues: () => form.getValues(),
  }));

  const mutation = useMutation({
    mutationFn: (payload: IBillingInformation) => getCustomerProfileApi().updateMyProfile({ billingInformation: payload }),
    onSuccess: () => {
      toaster.success({ title: 'Billing info saved' });
      return queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    },
    onError: () => {
      toaster.error({ title: 'Failed to save billing info' });
    },
  });

  return (
    <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={5}>
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="semibold">
              Billing Information
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Contact details attached to your orders and payments.
            </Text>
          </VStack>

          <FormProvider {...form}>
            <BillingInfoFields required={required} />
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
              {mutation.isPending ? <Spinner size="sm" /> : 'Save billing info'}
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
});
