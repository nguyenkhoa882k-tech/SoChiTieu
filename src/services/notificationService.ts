// @ts-ignore - react-native-push-notification doesn't have types
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Request notification permission for Android 13+
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Quyền thông báo',
            message: 'Ứng dụng cần quyền để gửi thông báo nhắc nhở hàng ngày',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // Android < 13 doesn't need runtime permission
  } else if (Platform.OS === 'ios') {
    // For iOS, request permissions through PushNotification
    return new Promise(resolve => {
      PushNotification.requestPermissions(['alert', 'badge', 'sound']).then(
        (permissions: any) => {
          resolve(permissions.alert === 1);
        },
      );
    });
  }
  return true;
};

// Check if notification permission is granted
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted;
      } catch (err) {
        console.warn('Permission check error:', err);
        return false;
      }
    }
    return true;
  } else if (Platform.OS === 'ios') {
    return new Promise(resolve => {
      PushNotification.checkPermissions((permissions: any) => {
        resolve(permissions.alert === 1);
      });
    });
  }
  return true;
};

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
export const scheduleDailyReminder = async (hour: number, minute: number) => {
  // Check and request permission first
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Không có quyền thông báo',
        'Vui lòng cấp quyền thông báo trong cài đặt để nhận nhắc nhở hàng ngày',
      );
      return false;
    }
  }

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
  return true;
};

// Cancel daily reminder
export const cancelDailyReminder = () => {
  PushNotification.cancelLocalNotification('daily-reminder-1');
  console.log('Daily reminder cancelled');
};

// Send immediate test notification
export const sendTestNotification = async () => {
  // Check and request permission first
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Không có quyền thông báo',
        'Vui lòng cấp quyền thông báo trong cài đặt để nhận thông báo',
      );
      return;
    }
  }

  PushNotification.localNotification({
    channelId: 'daily-reminder',
    title: '💰 Thử nghiệm thông báo',
    message: 'Thông báo đang hoạt động tốt!',
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
  });

  console.log('Test notification sent');
};

// Check notification permissions (iOS) - Deprecated, use checkNotificationPermission
export const checkPermissions = (callback: (permissions: any) => void) => {
  PushNotification.checkPermissions(callback);
};

// Request permissions (iOS) - Deprecated, use requestNotificationPermission
export const requestPermissions = () => {
  PushNotification.requestPermissions();
};
