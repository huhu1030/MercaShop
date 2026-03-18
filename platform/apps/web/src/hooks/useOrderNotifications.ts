import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { isNotificationsEnabledAtom } from '../store/atoms';
import { useWebSocket } from './useWebSocket';

export function useOrderNotifications(apiUrl: string): void {
  const isEnabled = useAtomValue(isNotificationsEnabledAtom);
  const { onNewOrders } = useWebSocket(apiUrl);

  useEffect(() => {
    if (!isEnabled) return;

    const cleanup = onNewOrders(() => {
      if (Notification.permission === 'granted') {
        new Notification('New order received', { tag: 'new-order' });
      }
    });

    return cleanup;
  }, [isEnabled, onNewOrders]);
}
