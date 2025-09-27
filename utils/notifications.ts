
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
      try {
        await Notifications.setNotificationChannelAsync('pet-reminders', {
          name: 'Pet Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (channelError) {
        console.error('Error setting up notification channel:', channelError);
        // Continue anyway, as this is not critical
      }
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
      console.log('Cannot schedule notification: permissions not granted');
      return null;
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
    if (!notificationId) {
      console.log('Cannot cancel notification: no ID provided');
      return;
    }
    
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
    // Don't throw error, as this is not critical
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    // Don't throw error, as this is not critical
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
  try {
    const [hours, minutes] = feedingTime.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid feeding time format:', feedingTime);
      return null;
    }
    
    return await scheduleNotification({
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
  } catch (error) {
    console.error('Error scheduling feeding reminder:', error);
    return null;
  }
};

export const scheduleActivityReminder = async (
  petName: string,
  activityType: string,
  reminderTime: Date
): Promise<string | null> => {
  try {
    if (!reminderTime || isNaN(reminderTime.getTime())) {
      console.error('Invalid reminder time:', reminderTime);
      return null;
    }
    
    return await scheduleNotification({
      id: `activity-${Date.now()}`,
      title: `Activity Time for ${petName}`,
      body: `Time for ${petName}'s ${activityType}`,
      data: { type: 'activity', petName, activityType },
      trigger: {
        date: reminderTime,
      },
    });
  } catch (error) {
    console.error('Error scheduling activity reminder:', error);
    return null;
  }
};

export const scheduleGroomingReminder = async (
  petName: string,
  groomingType: string,
  dueDate: Date
): Promise<string | null> => {
  try {
    if (!dueDate || isNaN(dueDate.getTime())) {
      console.error('Invalid due date:', dueDate);
      return null;
    }
    
    return await scheduleNotification({
      id: `grooming-${Date.now()}`,
      title: `Grooming Reminder for ${petName}`,
      body: `${petName} is due for ${groomingType}`,
      data: { type: 'grooming', petName, groomingType },
      trigger: {
        date: dueDate,
      },
    });
  } catch (error) {
    console.error('Error scheduling grooming reminder:', error);
    return null;
  }
};
