import { Center, Spinner, VStack } from '@chakra-ui/react';
import { getCustomerProfileApi } from '@mercashop/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import { BillingInfoCard } from '../components/BillingInfoCard';
import { DeliveryAddressCard } from '../components/DeliveryAddressCard';
import { PersonalInfoCard } from '../components/PersonalInfoCard';

export function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await getCustomerProfileApi().getMyProfile();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Center py={{ base: 6, md: 12 }}>
      <VStack align="stretch" gap={3} width="full" maxW="xl">
        <PersonalInfoCard />
        <BillingInfoCard defaultValues={profile?.billingInformation} />
        <DeliveryAddressCard defaultValues={profile?.deliveryAddress} />
      </VStack>
    </Center>
  );
}
