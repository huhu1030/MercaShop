import { Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignUpForm } from '../components/SignUpForm';
import { useAuth } from '../hooks/useAuth';

export function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  return (
    <Center minH={{ base: 'auto', md: '70vh' }} px={{ base: 0, md: 4 }}>
      <SignUpForm />
    </Center>
  );
}
