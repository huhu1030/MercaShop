import { Center, Spinner } from '@chakra-ui/react';
import { Colors } from '../../constants/colors';

export function LoadingScreen() {
  return (
    <Center minH="12.5rem">
      <Spinner size="xl" color={Colors.brand.spinner} />
    </Center>
  );
}
