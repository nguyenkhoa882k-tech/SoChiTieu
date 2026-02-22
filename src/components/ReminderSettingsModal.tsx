import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';
import { useReminderStore } from '@/stores/reminderStore';
import {
  sendTestNotification,
  requestNotificationPermission,
  checkNotificationPermission,
} from '@/services/notificationService';

interface ReminderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ReminderSettingsModal({
  visible,
  onClose,
}: ReminderSettingsModalProps) {
  const palette = useThemeStore(state => state.palette);
  const { enabled, hour, minute, setEnabled, setTime } = useReminderStore();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Check if we have permission
      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        // Request permission
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            'Không có quyền thông báo',
            'Vui lòng cấp quyền thông báo trong cài đặt để nhận nhắc nhở hàng ngày',
            [{ text: 'OK' }],
          );
          return;
        }
      }
    }
    await setEnabled(value);
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (selectedDate) {
      const newHour = selectedDate.getHours();
      const newMinute = selectedDate.getMinutes();
      await setTime(newHour, newMinute);
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const formatTime = (h: number, m: number) => {
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const currentTime = new Date();
  currentTime.setHours(hour, minute, 0, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={e => e.stopPropagation()}
          style={[
            styles.content,
            {
              backgroundColor: '#1a1f2e',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#F1F5F9' }]}>
              Nhắc lịch chi tiêu
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#F1F5F9" />
            </Pressable>
          </View>

          <ScrollView style={styles.body}>
            {/* Enable/Disable */}
            <View
              style={[styles.row, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: `#10B98115` }]}
                >
                  <Feather name="bell" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: '#F1F5F9' }]}>
                    Bật nhắc nhở
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: '#94A3B8' }]}>
                    Nhận thông báo hàng ngày
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{
                  true: '#10B981',
                  false: 'rgba(255, 255, 255, 0.1)',
                }}
                thumbColor="#fff"
                value={enabled}
                onValueChange={handleToggle}
              />
            </View>

            {/* Time Picker */}
            <Pressable
              style={[styles.row, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}
              onPress={() => enabled && setShowTimePicker(true)}
              disabled={!enabled}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: `#10B98115` }]}
                >
                  <Feather name="clock" size={20} color="#10B981" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: enabled ? '#F1F5F9' : '#64748B' },
                    ]}
                  >
                    Giờ nhắc nhở
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: '#94A3B8' }]}>
                    Chọn thời gian nhận thông báo
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.timeText,
                  { color: enabled ? '#10B981' : '#64748B' },
                ]}
              >
                {formatTime(hour, minute)}
              </Text>
            </Pressable>

            {/* Test Notification - Only in DEV mode */}
            {__DEV__ && (
              <Pressable
                style={[
                  styles.row,
                  {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={handleTestNotification}
              >
                <View style={styles.rowLeft}>
                  <View
                    style={[styles.iconBox, { backgroundColor: `#10B98115` }]}
                  >
                    <Feather name="send" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={[styles.rowTitle, { color: '#F1F5F9' }]}>
                      Gửi thông báo thử
                    </Text>
                    <Text style={[styles.rowSubtitle, { color: '#94A3B8' }]}>
                      Kiểm tra thông báo hoạt động
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#64748B" />
              </Pressable>
            )}

            {/* Info box */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: `#10B98110`,
                  borderColor: '#10B981',
                },
              ]}
            >
              <Feather name="info" size={16} color="#10B981" />
              <Text style={[styles.infoText, { color: '#F1F5F9' }]}>
                Thông báo sẽ được gửi mỗi ngày vào thời gian đã chọn để nhắc bạn
                ghi lại chi tiêu hàng ngày.
              </Text>
            </View>
          </ScrollView>

          {showTimePicker && (
            <DateTimePicker
              value={currentTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <Pressable
            style={[
              styles.closeButtonBottom,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: '#94A3B8' }]}>Đóng</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButtonBottom: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
