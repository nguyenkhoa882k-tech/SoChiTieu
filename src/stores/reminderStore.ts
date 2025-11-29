import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/services/notificationService';

const REMINDER_STORAGE_KEY = 'sochitieu.reminder.settings';

interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

interface ReminderState extends ReminderSettings {
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
  initReminder: () => Promise<void>;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 20, // 8 PM
  minute: 0,
};

export const useReminderStore = create<ReminderState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  setEnabled: async (enabled: boolean) => {
    const { hour, minute } = get();

    if (enabled) {
      const success = await scheduleDailyReminder(hour, minute);
      if (!success) {
        // If permission was denied, don't enable
        return;
      }
    } else {
      cancelDailyReminder();
    }

    set({ enabled });

    // Save to storage
    const settings: ReminderSettings = { enabled, hour, minute };
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  },

  setTime: async (hour: number, minute: number) => {
    const { enabled } = get();
    set({ hour, minute });

    // Reschedule if enabled
    if (enabled) {
      scheduleDailyReminder(hour, minute);
    }

    // Save to storage
    const settings: ReminderSettings = { enabled, hour, minute };
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  },

  initReminder: async () => {
    try {
      const saved = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
      if (saved) {
        const settings: ReminderSettings = JSON.parse(saved);
        set(settings);

        // Schedule if enabled
        if (settings.enabled) {
          scheduleDailyReminder(settings.hour, settings.minute);
        }
      }
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
  },
}));
