import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { initApiClient } from '@mercashop/shared/api-client';
import { environment } from '@mercashop/shared/config/environment';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import App from './App';

initApiClient({
  getAccessToken: async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ?? null;
  },
  forceRefreshToken: async () => {
    const token = await auth.currentUser?.getIdToken(true);
    return token ?? null;
  },
  signOut: () => signOut(auth),
  basePath: environment.API_URL,
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
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
