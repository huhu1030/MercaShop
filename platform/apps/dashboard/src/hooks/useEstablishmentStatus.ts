import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEstablishmentApi } from '@mercashop/shared/api-client';
import { EstablishmentStatus } from '@mercashop/shared';
import axios from 'axios';
import { toaster } from '../components/ui/toaster';

export function useEstablishmentStatus(establishmentId: string | undefined) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['establishment', establishmentId],
    queryFn: () => getEstablishmentApi().getEstablishment(establishmentId!),
    enabled: !!establishmentId,
  });

  const status = data?.data?.establishment?.status;

  const mutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      getEstablishmentApi().updateStatus({ establishmentId: id, status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishment', establishmentId] });
      queryClient.invalidateQueries({ queryKey: ['establishments'] });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toaster.create({
        title: 'Failed to update status',
        description: message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    },
  });

  const toggleStatus = () => {
    if (!establishmentId || !status) return;

    const newStatus = status === EstablishmentStatus.OPEN ? EstablishmentStatus.CLOSED : EstablishmentStatus.OPEN;

    if (newStatus === EstablishmentStatus.CLOSED) {
      const confirmed = window.confirm("Are you sure? Customers won't be able to place orders while closed.");
      if (!confirmed) return;
    }

    mutation.mutate({ id: establishmentId, newStatus });
  };

  const isOpen = status === EstablishmentStatus.OPEN;

  return {
    status,
    isOpen,
    toggleStatus,
    isPending: mutation.isPending,
  };
}
