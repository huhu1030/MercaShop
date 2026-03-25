import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem, Toaster, Toast } from '@chakra-ui/react';
import { initApiClient } from '@mercashop/shared/api-client';
import { getFirebaseAuth } from './lib/firebase';
import App from './App';
import { toaster } from './components/toaster';

const auth = getFirebaseAuth();

initApiClient({
  getAccessToken: async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ?? null;
  },
  forceRefreshToken: async () => {
    const token = await auth.currentUser?.getIdToken(true);
    return token ?? null;
  },
  signOut: () => auth.signOut(),
  basePath: import.meta.env.VITE_API_URL,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <App />
        <Toaster toaster={toaster}>
          {(toast) => (
            <Toast.Root>
              <Toast.Indicator />
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
              <Toast.CloseTrigger />
            </Toast.Root>
          )}
        </Toaster>
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
