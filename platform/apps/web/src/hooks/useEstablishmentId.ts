import { useParams } from 'react-router-dom';

export function useEstablishmentId(): { establishmentId: string } | null {
  const { establishmentId } = useParams<{ establishmentId: string }>();
  if (!establishmentId) return null;
  return { establishmentId };
}
