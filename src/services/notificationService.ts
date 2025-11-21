// @ts-ignore - react-native-push-notification doesn't have types
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

// Create notification channel for Android
export const createNotificationChannel = () => {
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'daily-reminder',
        channelName: 'Nhắc nhở hàng ngày',
        channelDescription: 'Nhắc nhở ghi chép chi tiêu hàng ngày',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created: boolean) => console.log(`Channel created: ${created}`),
    );
  }
};

// Initialize push notifications
export const initializeNotifications = () => {
  PushNotification.configure({
    // Called when Token is generated (iOS and Android)
    onRegister: function (token: any) {
      console.log('TOKEN:', token);
    },

    // Called when a remote or local notification is opened or received
    onNotification: function (notification: any) {
      console.log('NOTIFICATION:', notification);
    },

    // Android only: GCM or FCM Sender ID
    senderID: undefined,

    // iOS only
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    popInitialNotification: true,

    // Request permissions on iOS
    requestPermissions: Platform.OS === 'ios',
  });

  createNotificationChannel();
};

// Schedule daily reminder
export const scheduleDailyReminder = (hour: number, minute: number) => {
  // Cancel existing reminders first
  cancelDailyReminder();

  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);

  // If scheduled time is in the past today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  PushNotification.localNotificationSchedule({
    channelId: 'daily-reminder',
    id: 'daily-reminder-1',
    title: '💰 Nhắc nhở ghi chép chi tiêu',
    message: 'Đừng quên ghi lại các khoản chi tiêu hôm nay nhé!',
    date: scheduledTime,
    allowWhileIdle: true,
    repeatType: 'day', // Repeat daily
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
  });

  console.log(`Reminder scheduled for ${hour}:${minute} daily`);
};

// Cancel daily reminder
export const cancelDailyReminder = () => {
  PushNotification.cancelLocalNotification('daily-reminder-1');
  console.log('Daily reminder cancelled');
};

// Send immediate test notification
export const sendTestNotification = () => {
  PushNotification.localNotification({
    channelId: 'daily-reminder',
    title: '💰 Thử nghiệm thông báo',
    message: 'Thông báo đang hoạt động tốt!',
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
  });
};

// Check notification permissions (iOS)
export const checkPermissions = (callback: (permissions: any) => void) => {
  PushNotification.checkPermissions(callback);
};

// Request permissions (iOS)
export const requestPermissions = () => {
  PushNotification.requestPermissions();
};
