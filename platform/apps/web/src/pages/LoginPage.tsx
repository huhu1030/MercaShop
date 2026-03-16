import {type FormEvent, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, Button, Center, Field, Heading, Input, Text, VStack,} from '@chakra-ui/react';
import {useAuth} from '../hooks/useAuth';
import {Colors} from '../constants/colors';

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
    <Center minH="100vh" bg={Colors.surface.background}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={Colors.surface.card}
        p="2rem"
        borderRadius="lg"
        shadow="md"
        w="full"
        maxW="25rem"
      >
        <VStack gap="1.25rem">
          <Heading size="xl" color={Colors.brand.primary}>MercaShop</Heading>
          <Heading size="md" color={Colors.text.primary}>Sign in to your account</Heading>

          {error && (
            <Box w="full" p="0.75rem" bg={Colors.feedback.errorBg} borderRadius="md" borderLeft="0.25rem solid" borderColor={Colors.feedback.errorBorder}>
              <Text color={Colors.feedback.errorText} fontSize="sm">{error}</Text>
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
