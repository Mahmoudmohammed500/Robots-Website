// hooks/useGlobalNotifications.js
import { useEffect } from 'react';
import { useMqtt } from '@/context/MqttContext';

export default function useGlobalNotifications() {
  const { registerNotificationCallback, isConnected } = useMqtt();

  useEffect(() => {
    if (!isConnected) return;

    // سجل callback علشان تستقبل كل الإشعارات
    const unsubscribe = registerNotificationCallback((notification) => {
      console.log('📢 Global Notification Received:', notification);
      
      // هنا تقدر تعمل أي حاجة بالإشعار
      // مثلاً تحفظ في state أو تعمل actions معينة
    });

    return unsubscribe;
  }, [isConnected, registerNotificationCallback]);

  return { isConnected };
}