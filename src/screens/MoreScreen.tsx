import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemePalette } from '@/theme/ThemeProvider';
import { AdBanner } from '@/components/AdBanner';

export function MoreScreen() {
  const { palette, preference, toggleTheme } = useThemePalette();

  const shortcuts = [
    {
      icon: 'bell',
      title: 'Nhắc lịch chi tiêu',
      subtitle: 'Đặt nhắc nhở tiết kiệm mỗi tuần',
      onPress: () => Alert.alert('Nhắc lịch', 'Tính năng sẽ sớm khả dụng'),
    },
    {
      icon: 'download',
      title: 'Xuất báo cáo CSV',
      subtitle: 'Gửi file qua email chỉ với 1 chạm',
      onPress: () => Alert.alert('Xuất báo cáo', 'Đang chuẩn bị file mẫu'),
    },
    {
      icon: 'life-buoy',
      title: 'Trung tâm hỗ trợ',
      subtitle: 'Gửi phản hồi hoặc xem hướng dẫn',
      onPress: () => Linking.openURL('mailto:support@sochitieu.app'),
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Giao diện</Text>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>Chế độ tối</Text>
            <Text style={{ color: palette.muted }}>Tự động theo hệ thống</Text>
          </View>
          <Switch
            trackColor={{ true: palette.primary, false: palette.border }}
            thumbColor="#fff"
            value={preference === 'dark'}
            onValueChange={state => toggleTheme(state ? 'dark' : 'light')}
          />
        </View>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>Đồng bộ hệ thống</Text>
            <Text style={{ color: palette.muted }}>Tự động áp dụng theme hệ thống</Text>
          </View>
          <Switch
            value={preference === 'system'}
            onValueChange={state => toggleTheme(state ? 'system' : 'light')}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Tiện ích</Text>
        {shortcuts.map(item => (
          <Pressable
            key={item.title}
            style={[styles.shortcutRow, { borderColor: palette.border }]}
            onPress={item.onPress}
          >
            <View style={[styles.iconWrapper, { backgroundColor: `${palette.primary}15` }]}> 
              <Feather name={item.icon as any} size={20} color={palette.primary} />
            </View>
            <View style={styles.flexFill}>
              <Text style={[styles.title, { color: palette.text }]}>{item.title}</Text>
              <Text style={{ color: palette.muted }}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={palette.muted} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Quảng cáo ưu đãi</Text>
        <Text style={{ color: palette.muted }}>
          Bật quảng cáo thử nghiệm để đảm bảo tích hợp hoàn chỉnh trước khi lên store.
        </Text>
        <AdBanner placement="more" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  flexFill: {
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
