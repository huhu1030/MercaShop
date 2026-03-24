import { Button, Card, Center, Field, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { getUserApi } from '@mercashop/shared/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  phone: string;
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

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await getUserApi().getMe();
      return response.data.user as Record<string, any>;
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

  const updateMutation = useMutation({
    mutationFn: (payload: ProfileFormState) => getUserApi().updateMe(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Center py={{ base: 6, md: 12 }}>
      <Card.Root width="full" maxW="xl" borderRadius="3xl" boxShadow="xl">
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
    </Center>
  );
}
