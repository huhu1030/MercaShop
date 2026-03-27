import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface NewOrderEvent {
  orderId: string;
}

export function useWebSocket(apiUrl: string, establishmentId: string) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    user.getIdToken().then((token) => {
      if (cancelled) return;

      const socket = io(apiUrl, {
        transports: ['websocket'],
        auth: { token },
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-establishment', establishmentId);
      });
    });

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [apiUrl, establishmentId, user]);

  const onNewOrders = useCallback((callback: (data: NewOrderEvent) => void) => {
    socketRef.current?.on('newOrders', callback);
    return () => {
      socketRef.current?.off('newOrders', callback);
    };
  }, []);

  return { onNewOrders };
}

export type { NewOrderEvent };
