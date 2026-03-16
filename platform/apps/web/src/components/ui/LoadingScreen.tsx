import { Center, Spinner } from '@chakra-ui/react';

export function LoadingScreen() {
  return (
    <Center minH="200px">
      <Spinner size="xl" color="purple.500" />
    </Center>
  );
}
