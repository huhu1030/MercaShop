import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { environment } from '@mercashop/shared/config/environment';
import { sendNotification } from '../lib/notifications';
import { useAuth } from '../hooks/useAuth';

interface OrderUpdatedEvent {
  status?: string;
  _id?: string;
}

interface WebSocketContextValue {
  onOrderUpdated: (callback: (data: OrderUpdatedEvent) => void) => () => void;
}

const noopContext: WebSocketContextValue = {
  onOrderUpdated: () => () => {},
};

const WebSocketContext = createContext<WebSocketContextValue>(noopContext);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    user.getIdToken().then((token) => {
      if (cancelled) return;

      const socket = io(environment.API_URL, {
        transports: ['websocket'],
        auth: { token },
      });
      socketRef.current = socket;

      socket.on('order-updated', (payload: OrderUpdatedEvent) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-status'] });

        if (payload._id && payload.status) {
          sendNotification(payload._id, payload.status);
        }
      });
    });

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user, queryClient]);

  const onOrderUpdated = useCallback((callback: (data: OrderUpdatedEvent) => void) => {
    socketRef.current?.on('order-updated', callback);
    return () => {
      socketRef.current?.off('order-updated', callback);
    };
  }, []);

  return <WebSocketContext.Provider value={{ onOrderUpdated }}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket(): WebSocketContextValue {
  return useContext(WebSocketContext);
}

export type { OrderUpdatedEvent };
