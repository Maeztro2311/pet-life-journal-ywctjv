
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  trigger: Notifications.NotificationTriggerInput;
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }
    
    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pet-reminders', {
        name: 'Pet Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    console.log('Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleNotification = async (notificationData: NotificationData): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: true,
      },
      trigger: notificationData.trigger,
    });
    
    console.log('Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Helper functions for common notification types
export const scheduleFeedingReminder = async (
  petName: string,
  feedingTime: string,
  foodType: string
): Promise<string | null> => {
  const [hours, minutes] = feedingTime.split(':').map(Number);
  
  return scheduleNotification({
    id: `feeding-${Date.now()}`,
    title: `Feeding Time for ${petName}`,
    body: `Time to feed ${petName} their ${foodType}`,
    data: { type: 'feeding', petName, feedingTime, foodType },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
};

export const scheduleActivityReminder = async (
  petName: string,
  activityType: string,
  reminderTime: Date
): Promise<string | null> => {
  return scheduleNotification({
    id: `activity-${Date.now()}`,
    title: `Activity Time for ${petName}`,
    body: `Time for ${petName}'s ${activityType}`,
    data: { type: 'activity', petName, activityType },
    trigger: {
      date: reminderTime,
    },
  });
};

export const scheduleGroomingReminder = async (
  petName: string,
  groomingType: string,
  dueDate: Date
): Promise<string | null> => {
  return scheduleNotification({
    id: `grooming-${Date.now()}`,
    title: `Grooming Reminder for ${petName}`,
    body: `${petName} is due for ${groomingType}`,
    data: { type: 'grooming', petName, groomingType },
    trigger: {
      date: dueDate,
    },
  });
};
