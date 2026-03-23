import { Center, VStack, Text, Heading } from '@chakra-ui/react';
import { Colors } from '../../constants/colors';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Center minH="12.5rem">
      <VStack gap="0.75rem">
        {icon}
        <Heading size="md" color={Colors.text.secondary}>{title}</Heading>
        {description && <Text color={Colors.text.muted}>{description}</Text>}
      </VStack>
    </Center>
  );
}
