import { Button, Card, Field, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { getUserApi } from '@mercashop/shared/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toaster } from './ui/toaster.tsx';

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export function PersonalInfoCard() {
  const queryClient = useQueryClient();

  const form = useForm<PersonalInfoForm>({
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  const { data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await getUserApi().getMe();
      return response.data.user as { firstName: string; lastName: string; phone: string; email: string };
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      phone: data.phone ?? '',
    });
  }, [data, form.reset]);

  const mutation = useMutation({
    mutationFn: (payload: PersonalInfoForm) => getUserApi().updateMe(payload),
    onSuccess: () => {
      toaster.success({ title: 'Profile saved' });
      return queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      toaster.error({ title: 'Failed to save profile' });
    },
  });

  return (
    <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={5}>
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="semibold">
              Your profile
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Manage your personal details and account access.
            </Text>
          </VStack>

          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input value={data?.email ?? ''} readOnly />
          </Field.Root>

          <Field.Root>
            <Field.Label>First name</Field.Label>
            <Input {...form.register('firstName')} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Last name</Field.Label>
            <Input {...form.register('lastName')} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Phone</Field.Label>
            <Input {...form.register('phone')} />
          </Field.Root>

          <VStack align="stretch" gap={3} pt={2}>
            <Button
              type="button"
              colorPalette="green"
              disabled={mutation.isPending || !form.formState.isDirty}
              onClick={async () => {
                const valid = await form.trigger();
                if (valid) mutation.mutate(form.getValues());
              }}
            >
              {mutation.isPending ? <Spinner size="sm" /> : 'Save changes'}
            </Button>
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
