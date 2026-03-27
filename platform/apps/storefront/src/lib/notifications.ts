export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendNotification(orderId: string, status: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const label = status.replace(/_/g, ' ').toLowerCase();
  new Notification('Order update', {
    body: `Your order #${orderId.slice(-6).toUpperCase()} is now ${label}`,
    tag: `order-${orderId}`,
  });
}
