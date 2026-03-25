import { Button, Card, Center, Field, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { getCustomerProfileApi, getUserApi } from '@mercashop/shared/api-client';
import type { IBillingInformation, IDeliveryAddress } from '@mercashop/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  phone: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [billingForm, setBillingForm] = useState<IBillingInformation>({
    name: '',
    email: '',
    phone: '',
    vatNumber: '',
  });

  const [deliveryForm, setDeliveryForm] = useState<IDeliveryAddress>({
    street: '',
    number: '',
    zipCode: '',
    city: '',
    municipality: '',
    comment: '',
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
    setForm({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      phone: data.phone ?? '',
    });
  }, [data]);

  useEffect(() => {
    if (!profile) return;
    setBillingForm({
      name: profile.billingInformation?.name ?? '',
      email: profile.billingInformation?.email ?? '',
      phone: profile.billingInformation?.phone ?? '',
      vatNumber: profile.billingInformation?.vatNumber ?? '',
    });
    setDeliveryForm({
      street: profile.deliveryAddress?.street ?? '',
      number: profile.deliveryAddress?.number ?? '',
      zipCode: profile.deliveryAddress?.zipCode ?? '',
      city: profile.deliveryAddress?.city ?? '',
      municipality: profile.deliveryAddress?.municipality ?? '',
      comment: profile.deliveryAddress?.comment ?? '',
    });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: ProfileFormState) => getUserApi().updateMe(payload),
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
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input value={data?.email ?? ''} readOnly />
              </Field.Root>

              <Field.Root>
                <Field.Label>First name</Field.Label>
                <Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Last name</Field.Label>
                <Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Phone</Field.Label>
                <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </Field.Root>

              {updateMutation.isError && (
                <Text color="red.500">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Profile update failed'}</Text>
              )}

              <VStack align="stretch" gap={3} pt={2}>
                <Button colorPalette="green" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Spinner size="sm" /> : 'Save changes'}
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </VStack>
            </VStack>
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
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label>Name</Field.Label>
                <Input value={billingForm.name ?? ''} onChange={(event) => setBillingForm((current) => ({ ...current, name: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input value={billingForm.email ?? ''} onChange={(event) => setBillingForm((current) => ({ ...current, email: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Phone</Field.Label>
                <Input value={billingForm.phone ?? ''} onChange={(event) => setBillingForm((current) => ({ ...current, phone: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>VAT Number</Field.Label>
                <Input value={billingForm.vatNumber ?? ''} onChange={(event) => setBillingForm((current) => ({ ...current, vatNumber: event.target.value }))} />
              </Field.Root>

              {billingMutation.isError && (
                <Text color="red.500">{billingMutation.error instanceof Error ? billingMutation.error.message : 'Billing update failed'}</Text>
              )}

              <VStack align="stretch" gap={3} pt={2}>
                <Button colorPalette="green" onClick={() => billingMutation.mutate(billingForm)} disabled={billingMutation.isPending}>
                  {billingMutation.isPending ? <Spinner size="sm" /> : 'Save billing info'}
                </Button>
              </VStack>
            </VStack>
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
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label>Street</Field.Label>
                <Input value={deliveryForm.street ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, street: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Number</Field.Label>
                <Input value={deliveryForm.number ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, number: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Zip Code</Field.Label>
                <Input value={deliveryForm.zipCode ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, zipCode: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>City</Field.Label>
                <Input value={deliveryForm.city ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, city: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Municipality</Field.Label>
                <Input value={deliveryForm.municipality ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, municipality: event.target.value }))} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Comment</Field.Label>
                <Input value={deliveryForm.comment ?? ''} onChange={(event) => setDeliveryForm((current) => ({ ...current, comment: event.target.value }))} />
              </Field.Root>

              {deliveryMutation.isError && (
                <Text color="red.500">{deliveryMutation.error instanceof Error ? deliveryMutation.error.message : 'Delivery address update failed'}</Text>
              )}

              <VStack align="stretch" gap={3} pt={2}>
                <Button colorPalette="green" onClick={() => deliveryMutation.mutate(deliveryForm)} disabled={deliveryMutation.isPending}>
                  {deliveryMutation.isPending ? <Spinner size="sm" /> : 'Save delivery address'}
                </Button>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Center>
  );
}
