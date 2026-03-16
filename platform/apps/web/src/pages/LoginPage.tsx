import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Center,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Field,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/orders');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        p={8}
        borderRadius="lg"
        shadow="md"
        w="full"
        maxW="400px"
      >
        <VStack gap={5}>
          <Heading size="xl" color="purple.600">MercaShop</Heading>
          <Heading size="md" color="gray.700">Sign in to your account</Heading>

          {error && (
            <Box w="full" p={3} bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.500">
              <Text color="red.700" fontSize="sm">{error}</Text>
            </Box>
          )}

          <Field.Root w="full" required>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>

          <Field.Root w="full" required>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          <Button
            type="submit"
            w="full"
            colorPalette="purple"
            loading={isSubmitting}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
