import { Button, Card, Center, Field, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { getCustomerProfileApi, getUserApi } from '@mercashop/shared/api-client';
import type { IBillingInformation, IDeliveryAddress } from '@mercashop/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const personalForm = useForm<PersonalInfoForm>({
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  const billingForm = useForm<IBillingInformation>({
    defaultValues: { name: '', email: '', phone: '', vatNumber: '' },
  });

  const deliveryForm = useForm<IDeliveryAddress>({
    defaultValues: { street: '', number: '', zipCode: '', city: '', municipality: '', comment: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await getUserApi().getMe();
      return response.data.user as UserProfile;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await getCustomerProfileApi().getMyProfile();
      return response.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    personalForm.reset({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      phone: data.phone ?? '',
    });
  }, [data, personalForm.reset]);

  useEffect(() => {
    if (!profile) return;
    billingForm.reset({
      name: profile.billingInformation?.name ?? '',
      email: profile.billingInformation?.email ?? '',
      phone: profile.billingInformation?.phone ?? '',
      vatNumber: profile.billingInformation?.vatNumber ?? '',
    });
    deliveryForm.reset({
      street: profile.deliveryAddress?.street ?? '',
      number: profile.deliveryAddress?.number ?? '',
      zipCode: profile.deliveryAddress?.zipCode ?? '',
      city: profile.deliveryAddress?.city ?? '',
      municipality: profile.deliveryAddress?.municipality ?? '',
      comment: profile.deliveryAddress?.comment ?? '',
    });
  }, [profile, billingForm.reset, deliveryForm.reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: PersonalInfoForm) => getUserApi().updateMe(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const billingMutation = useMutation({
    mutationFn: (payload: IBillingInformation) =>
      getCustomerProfileApi().updateMyProfile({ billingInformation: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-profile'] }),
  });

  const deliveryMutation = useMutation({
    mutationFn: (payload: IDeliveryAddress) =>
      getCustomerProfileApi().updateMyProfile({ deliveryAddress: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-profile'] }),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  if (isLoading || isProfileLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Center py={{ base: 6, md: 12 }}>
      <VStack align="stretch" gap={6} width="full" maxW="xl">
        <Card.Root borderRadius="3xl" boxShadow="xl">
          <Card.Header>
            <VStack align="start" gap={2}>
              <Text fontSize="2xl" fontWeight="bold">
                Your profile
              </Text>
              <Text color="fg.muted">Manage your personal details and account access.</Text>
            </VStack>
          </Card.Header>

          <Card.Body>
            <form onSubmit={personalForm.handleSubmit((values) => updateMutation.mutate(values))}>
              <VStack align="stretch" gap={4}>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input value={data?.email ?? ''} readOnly />
                </Field.Root>

                <Field.Root>
                  <Field.Label>First name</Field.Label>
                  <Input {...personalForm.register('firstName')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Last name</Field.Label>
                  <Input {...personalForm.register('lastName')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Phone</Field.Label>
                  <Input {...personalForm.register('phone')} />
                </Field.Root>

                {updateMutation.isError && (
                  <Text color="red.500">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Profile update failed'}</Text>
                )}

                <VStack align="stretch" gap={3} pt={2}>
                  <Button type="submit" colorPalette="green" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Spinner size="sm" /> : 'Save changes'}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </VStack>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        <Card.Root borderRadius="3xl" boxShadow="xl">
          <Card.Header>
            <VStack align="start" gap={2}>
              <Text fontSize="2xl" fontWeight="bold">
                Billing Information
              </Text>
              <Text color="fg.muted">Manage your billing details for invoices.</Text>
            </VStack>
          </Card.Header>

          <Card.Body>
            <form onSubmit={billingForm.handleSubmit((values) => billingMutation.mutate(values))}>
              <VStack align="stretch" gap={4}>
                <Field.Root>
                  <Field.Label>Name</Field.Label>
                  <Input {...billingForm.register('name')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input {...billingForm.register('email')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Phone</Field.Label>
                  <Input {...billingForm.register('phone')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>VAT Number</Field.Label>
                  <Input {...billingForm.register('vatNumber')} />
                </Field.Root>

                {billingMutation.isError && (
                  <Text color="red.500">{billingMutation.error instanceof Error ? billingMutation.error.message : 'Billing update failed'}</Text>
                )}

                <VStack align="stretch" gap={3} pt={2}>
                  <Button type="submit" colorPalette="green" disabled={billingMutation.isPending}>
                    {billingMutation.isPending ? <Spinner size="sm" /> : 'Save billing info'}
                  </Button>
                </VStack>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        <Card.Root borderRadius="3xl" boxShadow="xl">
          <Card.Header>
            <VStack align="start" gap={2}>
              <Text fontSize="2xl" fontWeight="bold">
                Delivery Address
              </Text>
              <Text color="fg.muted">Manage your default delivery address.</Text>
            </VStack>
          </Card.Header>

          <Card.Body>
            <form onSubmit={deliveryForm.handleSubmit((values) => deliveryMutation.mutate(values))}>
              <VStack align="stretch" gap={4}>
                <Field.Root>
                  <Field.Label>Street</Field.Label>
                  <Input {...deliveryForm.register('street')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Number</Field.Label>
                  <Input {...deliveryForm.register('number')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Zip Code</Field.Label>
                  <Input {...deliveryForm.register('zipCode')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>City</Field.Label>
                  <Input {...deliveryForm.register('city')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Municipality</Field.Label>
                  <Input {...deliveryForm.register('municipality')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Comment</Field.Label>
                  <Input {...deliveryForm.register('comment')} />
                </Field.Root>

                {deliveryMutation.isError && (
                  <Text color="red.500">{deliveryMutation.error instanceof Error ? deliveryMutation.error.message : 'Delivery address update failed'}</Text>
                )}

                <VStack align="stretch" gap={3} pt={2}>
                  <Button type="submit" colorPalette="green" disabled={deliveryMutation.isPending}>
                    {deliveryMutation.isPending ? <Spinner size="sm" /> : 'Save delivery address'}
                  </Button>
                </VStack>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Center>
  );
}
