import { Button, Card, Field, IconButton, Input, InputGroup, Spinner, Text, VStack } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SignInFormState {
  email: string;
  password: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed';
}

export function SignInForm() {
  const { signIn, signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<SignInFormState>({
    email: '',
    password: '',
  });

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card.Root width="full" maxW="lg" borderRadius="3xl" boxShadow="xl" borderWidth="1px" borderColor="blackAlpha.100" overflow="hidden">
      <Card.Header>
        <VStack align="start" gap={2}>
          <Text fontSize="2xl" fontWeight="bold">
            Sign in
          </Text>
          <Text color="fg.muted">Access your account to continue checkout and track orders.</Text>
        </VStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <InputGroup
              endElement={
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            >
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </InputGroup>
          </Field.Root>

          <Button colorPalette="green" onClick={handleSignIn} disabled={isSubmitting || loading}>
            {isSubmitting ? <Spinner size="sm" /> : 'Sign in'}
          </Button>

          <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting || loading}>
            Sign in with Google
          </Button>

          <Text color="fg.muted" fontSize="sm">
            Need an account? <RouterLink to="/sign-up">Create one here</RouterLink>.
          </Text>

          {error && <Text color="red.500">{error}</Text>}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
