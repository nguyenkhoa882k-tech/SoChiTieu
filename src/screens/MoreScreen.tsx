import React, { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/MainTabs';
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

      const result = await importData(filePath);

      if (result.success && result.data) {
        setConfirmModal({
          visible: true,
          title: 'Xác nhận nhập dữ liệu',
          message: `Tìm thấy ${result.data.transactions.length} giao dịch.\n\nDữ liệu mới sẽ được merge thông minh với dữ liệu hiện có (bỏ qua trùng lặp). Tiếp tục?`,
          onConfirm: async () => {
            setConfirmModal({ ...confirmModal, visible: false });
            try {
              const importResult = await importTransactions(
                result.data!.transactions,
              );

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
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1a1f2e', '#16213e', '#0f1419']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.glowLeft}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.3)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      <View style={styles.glowRight}>
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.25)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBarSpacer} />

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Báo cáo</Text>
            {reportShortcuts.map(item => (
              <Pressable
                key={item.title}
                style={styles.shortcutRow}
                onPress={item.onPress}
              >
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={[
                      'rgba(16, 185, 129, 0.2)',
                      'rgba(16, 185, 129, 0.1)',
                    ]}
                    style={styles.iconWrapperInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color="#10B981"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.flexFill}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#64748B" />
              </Pressable>
            ))}
          </LinearGradient>
        </View>

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Tiện ích</Text>
            {shortcuts.map(item => (
              <Pressable
                key={item.title}
                style={styles.shortcutRow}
                onPress={item.onPress}
                disabled={item.loading}
              >
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={[
                      'rgba(16, 185, 129, 0.2)',
                      'rgba(16, 185, 129, 0.1)',
                    ]}
                    style={styles.iconWrapperInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {item.loading ? (
                      <Text style={{ color: '#10B981' }}>⏳</Text>
                    ) : (
                      <Feather
                        name={item.icon as any}
                        size={16}
                        color="#10B981"
                      />
                    )}
                  </LinearGradient>
                </View>
                <View style={styles.flexFill}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#64748B" />
              </Pressable>
            ))}
          </LinearGradient>
        </View>

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Quảng cáo</Text>
            <Text style={styles.adStatus}>
              {__DEV__
                ? '✓ Đang bật (chế độ debug) - Quảng cáo test đang hiển thị'
                : '✗ Đã tắt (production) - Quảng cáo chỉ hiện khi debug'}
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? 20 : 40,
  },
  glowLeft: {
    position: 'absolute',
    left: -80,
    top: 140,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowRight: {
    position: 'absolute',
    right: -80,
    top: 400,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
  },
  container: {
    padding: 12,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 14,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.2,
  },
  title: {
    fontWeight: '700',
    fontSize: 13,
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  flexFill: {
    flex: 1,
  },
  iconWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  iconWrapperInner: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adStatus: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
});
