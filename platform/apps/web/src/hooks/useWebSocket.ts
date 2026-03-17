import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface NewOrderEvent {
  orderId: string;
}

export function useWebSocket(apiUrl: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(apiUrl);
    return () => {
      socketRef.current?.disconnect();
    };
  }, [apiUrl]);

  const onNewOrders = useCallback((callback: (data: NewOrderEvent) => void) => {
    socketRef.current?.on('newOrders', callback);
    return () => {
      socketRef.current?.off('newOrders', callback);
    };
  }, []);

  return { onNewOrders };
}

export type { NewOrderEvent };
