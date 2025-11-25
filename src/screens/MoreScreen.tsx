import React, { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/MainTabs';
import { useThemeStore } from '@/stores/themeStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { CustomModal } from '@/components/CustomModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FilePickerModal } from '@/components/FilePickerModal';
import { ExportOptionsModal } from '@/components/ExportOptionsModal';
import { ReminderSettingsModal } from '@/components/ReminderSettingsModal';
import { exportData, importData, shareExportedFile } from '@/utils/dataExport';
import { exportCSV, shareCSVFile } from '@/utils/csvExport';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function MoreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { palette, preference, setPreference } = useThemeStore();
  const { transactions, importTransactions, clearAllData } =
    useTransactionStore();
  const { customCategories, addCustomCategory } = useCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ title: '', message: '', type: 'info' });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{
    fileName: string;
    folderPath: string;
  } | null>(null);
  const [exportOptionsModal, setExportOptionsModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    filePath: string;
    type: 'data' | 'csv';
  }>({
    visible: false,
    title: '',
    message: '',
    filePath: '',
    type: 'data',
  });
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const result = await exportData(transactions, customCategories);

      if (result.success && result.filePath) {
        const fileName = result.filePath.split('/').pop() || 'file sao lưu';
        const folderPath =
          Platform.OS === 'android' ? 'Downloads' : 'Documents';

        setDownloadInfo({ fileName, folderPath });

        setExportOptionsModal({
          visible: true,
          title: 'Xuất dữ liệu thành công',
          message:
            result.message + `\n\nFile: ${fileName}\nVị trí: ${folderPath}`,
          filePath: result.filePath,
          type: 'data',
        });
      } else {
        setModalConfig({
          title: 'Lỗi',
          message: result.message,
          type: 'error',
        });
        setModalVisible(true);
      }
    } catch (error) {
      setModalConfig({
        title: 'Lỗi',
        message:
          error instanceof Error ? error.message : 'Không thể xuất dữ liệu',
        type: 'error',
      });
      setModalVisible(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    // Show file picker
    setShowFilePicker(true);
  };

  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);
      const result = await exportCSV(transactions);

      if (result.success && result.filePath) {
        const fileName = result.filePath.split('/').pop() || 'file CSV';
        const folderPath =
          Platform.OS === 'android' ? 'Downloads' : 'Documents';

        setDownloadInfo({ fileName, folderPath });

        setExportOptionsModal({
          visible: true,
          title: 'Xuất CSV thành công',
          message:
            result.message + `\n\nFile: ${fileName}\nVị trí: ${folderPath}`,
          filePath: result.filePath,
          type: 'csv',
        });
      } else {
        setModalConfig({
          title: 'Lỗi',
          message: result.message,
          type: 'error',
        });
        setModalVisible(true);
      }
    } catch (error) {
      setModalConfig({
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể xuất CSV',
        type: 'error',
      });
      setModalVisible(true);
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleFileSelected = async (filePath: string) => {
    setShowFilePicker(false);

    try {
      setIsImporting(true);

      // Import data
      const result = await importData(filePath);

      if (result.success && result.data) {
        // Confirm before importing
        setConfirmModal({
          visible: true,
          title: 'Xác nhận nhập dữ liệu',
          message: `Tìm thấy ${result.data.transactions.length} giao dịch.\n\nDữ liệu mới sẽ được merge thông minh với dữ liệu hiện có (bỏ qua trùng lặp). Tiếp tục?`,
          onConfirm: async () => {
            setConfirmModal({ ...confirmModal, visible: false });
            try {
              // Import transactions with smart merge
              const importResult = await importTransactions(
                result.data!.transactions,
              );

              // Import custom categories if available
              if (result.data!.customCategories) {
                for (const category of result.data!.customCategories) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { id, ...categoryData } = category;
                  await addCustomCategory(categoryData);
                }
              }

              setModalConfig({
                title: 'Nhập dữ liệu thành công',
                message: `Tổng số: ${importResult.total} giao dịch\nĐã nhập: ${importResult.imported} giao dịch mới\nBỏ qua: ${importResult.skipped} giao dịch trùng`,
                type: 'success',
              });
              setModalVisible(true);
            } catch {
              setModalConfig({
                title: 'Lỗi',
                message: 'Không thể nhập dữ liệu vào database',
                type: 'error',
              });
              setModalVisible(true);
            }
          },
        });
      } else {
        setModalConfig({
          title: 'Lỗi',
          message: result.message,
          type: 'error',
        });
        setModalVisible(true);
      }
    } catch (error) {
      setModalConfig({
        title: 'Lỗi',
        message:
          error instanceof Error ? error.message : 'Không thể nhập dữ liệu',
        type: 'error',
      });
      setModalVisible(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = () => {
    setConfirmModal({
      visible: true,
      title: 'Xóa toàn bộ dữ liệu?',
      message:
        'Hành động này sẽ xóa vĩnh viễn TẤT CẢ giao dịch của bạn và KHÔNG THỂ KHÔI PHỤC.\n\nBạn có chắc chắn muốn tiếp tục?',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, visible: false });
        try {
          await clearAllData();
          setModalConfig({
            title: 'Đã xóa',
            message: 'Tất cả dữ liệu đã được xóa thành công',
            type: 'success',
          });
          setModalVisible(true);
        } catch (error) {
          setModalConfig({
            title: 'Lỗi',
            message:
              error instanceof Error ? error.message : 'Không thể xóa dữ liệu',
            type: 'error',
          });
          setModalVisible(true);
        }
      },
    });
  };

  const shortcuts = [
    {
      icon: 'upload',
      title: 'Xuất dữ liệu',
      subtitle: 'Sao lưu dữ liệu đã mã hóa',
      onPress: handleExportData,
      loading: isExporting,
    },
    {
      icon: 'download',
      title: 'Nhập dữ liệu',
      subtitle: 'Khôi phục từ file sao lưu',
      onPress: handleImportData,
      loading: isImporting,
    },
    {
      icon: 'file-text',
      title: 'Xuất báo cáo CSV',
      subtitle: 'Gửi file qua email chỉ với 1 chạm',
      onPress: handleExportCSV,
      loading: isExportingCSV,
    },
    {
      icon: 'trash-2',
      title: 'Xóa toàn bộ dữ liệu',
      subtitle: 'Xóa vĩnh viễn tất cả giao dịch',
      onPress: handleClearAllData,
      loading: false,
    },
    {
      icon: 'bell',
      title: 'Nhắc lịch chi tiêu',
      subtitle: 'Đặt nhắc nhở hàng ngày',
      onPress: () => setShowReminderSettings(true),
      loading: false,
    },
    {
      icon: 'life-buoy',
      title: 'Trung tâm hỗ trợ',
      subtitle: 'Gửi phản hồi hoặc xem hướng dẫn',
      onPress: () => Linking.openURL('mailto:khoa882k@gmail.com'),
      loading: false,
    },
  ];

  const reportShortcuts = [
    {
      icon: 'calendar',
      title: 'Báo cáo tháng',
      subtitle: 'Xem thu chi theo tháng',
      onPress: () => navigation.navigate('MonthlyReport'),
    },
    {
      icon: 'bar-chart-2',
      title: 'Báo cáo năm',
      subtitle: 'Thống kê theo năm',
      onPress: () => navigation.navigate('YearlyReport'),
    },
    {
      icon: 'pie-chart',
      title: 'Báo cáo danh mục',
      subtitle: 'Phân tích chi tiết theo danh mục',
      onPress: () => navigation.navigate('CategoryReport'),
    },
    {
      icon: 'trending-up',
      title: 'Lịch sử thay đổi số dư',
      subtitle: 'Theo dõi biến động số dư',
      onPress: () => navigation.navigate('BalanceHistory'),
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.container}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Giao diện
        </Text>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>
              Chế độ tối
            </Text>
            <Text style={{ color: palette.muted }}>Tự động theo hệ thống</Text>
          </View>
          <Switch
            trackColor={{ true: palette.primary, false: palette.border }}
            thumbColor="#fff"
            value={preference === 'dark'}
            onValueChange={state => setPreference(state ? 'dark' : 'light')}
          />
        </View>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>
              Đồng bộ hệ thống
            </Text>
            <Text style={{ color: palette.muted }}>
              Tự động áp dụng theme hệ thống
            </Text>
          </View>
          <Switch
            value={preference === 'system'}
            onValueChange={state => setPreference(state ? 'system' : 'light')}
          />
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>Báo cáo</Text>
        {reportShortcuts.map(item => (
          <Pressable
            key={item.title}
            style={[styles.shortcutRow, { borderColor: palette.border }]}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${palette.primary}15` },
              ]}
            >
              <Feather
                name={item.icon as any}
                size={20}
                color={palette.primary}
              />
            </View>
            <View style={styles.flexFill}>
              <Text style={[styles.title, { color: palette.text }]}>
                {item.title}
              </Text>
              <Text style={{ color: palette.muted }}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={palette.muted} />
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Tiện ích
        </Text>
        {shortcuts.map(item => (
          <Pressable
            key={item.title}
            style={[styles.shortcutRow, { borderColor: palette.border }]}
            onPress={item.onPress}
            disabled={item.loading}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${palette.primary}15` },
              ]}
            >
              {item.loading ? (
                <Text style={{ color: palette.primary }}>⏳</Text>
              ) : (
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={palette.primary}
                />
              )}
            </View>
            <View style={styles.flexFill}>
              <Text style={[styles.title, { color: palette.text }]}>
                {item.title}
              </Text>
              <Text style={{ color: palette.muted }}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={palette.muted} />
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Quảng cáo ưu đãi
        </Text>
        <Text style={{ color: palette.muted }}>
          Bật quảng cáo thử nghiệm để đảm bảo tích hợp hoàn chỉnh trước khi lên
          store.
        </Text>
      </View>

      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      />

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={
          confirmModal.title.includes('Xóa')
            ? 'Xóa'
            : confirmModal.title.includes('CSV')
            ? 'Chia sẻ'
            : confirmModal.title.includes('xuất dữ liệu')
            ? 'Chia sẻ'
            : 'Nhập'
        }
        cancelText="Huỷ"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => {
          setConfirmModal({ ...confirmModal, visible: false });
        }}
        type={
          confirmModal.title.includes('Xóa')
            ? 'danger'
            : confirmModal.title.includes('xuất') ||
              confirmModal.title.includes('CSV')
            ? 'info'
            : 'warning'
        }
      />

      <FilePickerModal
        visible={showFilePicker}
        onSelect={handleFileSelected}
        onCancel={() => setShowFilePicker(false)}
      />

      <ExportOptionsModal
        visible={exportOptionsModal.visible}
        title={exportOptionsModal.title}
        message={exportOptionsModal.message}
        onShare={async () => {
          setExportOptionsModal({ ...exportOptionsModal, visible: false });
          try {
            if (exportOptionsModal.type === 'csv') {
              await shareCSVFile(exportOptionsModal.filePath);
            } else {
              await shareExportedFile(exportOptionsModal.filePath);
            }
            setModalConfig({
              title: 'Chia sẻ thành công',
              message: `File ${
                exportOptionsModal.type === 'csv' ? 'CSV' : 'sao lưu'
              } đã được chia sẻ`,
              type: 'success',
            });
            setModalVisible(true);
          } catch {
            // User cancelled share
            setModalConfig({
              title: 'Đã hủy chia sẻ',
              message: downloadInfo
                ? `File vẫn được lưu tại:\n${downloadInfo.folderPath}/${downloadInfo.fileName}`
                : 'File đã được lưu',
              type: 'info',
            });
            setModalVisible(true);
          }
        }}
        onDownload={() => {
          setExportOptionsModal({ ...exportOptionsModal, visible: false });
          if (downloadInfo) {
            setModalConfig({
              title: 'Tải xuống thành công',
              message: `File đã được lưu tại:\n${downloadInfo.folderPath}/${downloadInfo.fileName}`,
              type: 'success',
            });
            setModalVisible(true);
            setDownloadInfo(null);
          }
        }}
        onCancel={() => {
          setExportOptionsModal({ ...exportOptionsModal, visible: false });
          setDownloadInfo(null);
        }}
      />

      <ReminderSettingsModal
        visible={showReminderSettings}
        onClose={() => setShowReminderSettings(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  flexFill: {
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
