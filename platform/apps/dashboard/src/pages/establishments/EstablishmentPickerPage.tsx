import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Card, Heading, SimpleGrid, Text, VStack, HStack, Switch } from '@chakra-ui/react';
import { Store } from 'lucide-react';
import { getEstablishmentApi } from '@mercashop/shared/api-client';
import { EstablishmentStatus } from '@mercashop/shared';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';

export function EstablishmentPickerPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['establishments'],
    queryFn: () => getEstablishmentApi().getEstablishments(),
  });

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ establishmentId, status }: { establishmentId: string; status: string }) =>
      getEstablishmentApi().updateStatus({ establishmentId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] });
    },
  });

  const handleToggleStatus = (establishmentId: string, currentStatus: string) => {
    const newStatus = currentStatus === EstablishmentStatus.OPEN ? EstablishmentStatus.CLOSED : EstablishmentStatus.OPEN;

    if (newStatus === EstablishmentStatus.CLOSED) {
      const confirmed = window.confirm("Are you sure? Customers won't be able to place orders while closed.");
      if (!confirmed) return;
    }

    statusMutation.mutate({ establishmentId, status: newStatus });
  };

  if (isLoading) return <LoadingScreen />;

  if (isError) {
    return (
      <Box p="2rem" textAlign="center">
        <Text color={Colors.feedback.errorText}>Failed to load establishments. Please try again.</Text>
      </Box>
    );
  }

  const establishments = data?.data?.establishments ?? [];

  return (
    <Box minH="100vh" bg={Colors.surface.background} p="2rem">
      <VStack gap="1.5rem" maxW="50rem" mx="auto">
        <Heading size="lg">Select an Establishment</Heading>

        {establishments.length === 0 ? (
          <EmptyState icon={<Store size="2.5rem" />} title="No establishments" description="You don't have any establishments yet." />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="1rem" w="full">
            {establishments.map((establishment) => (
              <Card.Root
                key={establishment._id}
                variant="outline"
                cursor="pointer"
                _hover={{ borderColor: Colors.brand.primary, shadow: 'md' }}
                onClick={() => navigate(`/establishments/${establishment._id}/orders`)}
              >
                <Card.Body>
                  <VStack align="start" gap="0.5rem">
                    <HStack justify="space-between" w="full">
                      <Heading size="md">{establishment.name}</Heading>
                      <HStack gap={2} onClick={(e) => e.stopPropagation()}>
                        <Text fontSize="xs" color={Colors.text.muted}>
                          {establishment.status === EstablishmentStatus.OPEN ? 'Open' : 'Closed'}
                        </Text>
                        <Switch.Root
                          checked={establishment.status === EstablishmentStatus.OPEN}
                          onCheckedChange={() => handleToggleStatus(establishment._id, establishment.status)}
                          colorPalette={establishment.status === EstablishmentStatus.OPEN ? 'green' : 'gray'}
                          disabled={statusMutation.isPending}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      </HStack>
                    </HStack>
                    {establishment.category && (
                      <Text fontSize="sm" color={Colors.text.muted}>
                        {establishment.category}
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
}
