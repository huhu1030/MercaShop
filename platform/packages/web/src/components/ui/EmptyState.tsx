import { Center, VStack, Text, Heading } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Center minH="200px">
      <VStack gap={3}>
        {icon}
        <Heading size="md" color="gray.600">{title}</Heading>
        {description && <Text color="gray.500">{description}</Text>}
      </VStack>
    </Center>
  );
}
