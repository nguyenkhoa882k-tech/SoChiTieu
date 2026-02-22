import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';
import { getBackupFiles } from '@/utils/dataExport';

interface FilePickerModalProps {
  visible: boolean;
  onSelect: (filePath: string) => void;
  onCancel: () => void;
}

export function FilePickerModal({
  visible,
  onSelect,
  onCancel,
}: FilePickerModalProps) {
  const palette = useThemeStore(state => state.palette);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadFiles();
    } else {
      // Reset state when modal closes
      setLoading(true);
      setFiles([]);
    }
  }, [visible]);

  const loadFiles = async () => {
    setLoading(true);
    const backupFiles = await getBackupFiles();
    setFiles(backupFiles);
    setLoading(false);
  };

  const formatFileName = (filePath: string) => {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];

    // Extract timestamp from filename (SoChiTieu_Backup_TIMESTAMP.sct)
    const match = fileName.match(/SoChiTieu_Backup_(\d+)\.sct/);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      const date = new Date(timestamp);
      return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString(
        'vi-VN',
      )}`;
    }

    return fileName;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
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
              Chọn file sao lưu
            </Text>
            <Pressable onPress={onCancel} style={styles.closeButton}>
              <Feather name="x" size={24} color="#F1F5F9" />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={{ color: '#94A3B8' }}>Đang tải...</Text>
            </View>
          ) : files.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#64748B" />
              <Text style={[styles.emptyText, { color: '#F1F5F9' }]}>
                Không tìm thấy file sao lưu
              </Text>
              <Text style={{ color: '#94A3B8', textAlign: 'center' }}>
                Hãy xuất dữ liệu trước để tạo file sao lưu
              </Text>
            </View>
          ) : (
            <View style={styles.fileListContainer}>
              <ScrollView
                style={styles.fileList}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {files.map(filePath => (
                  <Pressable
                    key={filePath}
                    style={[
                      styles.fileItem,
                      {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    ]}
                    onPress={() => onSelect(filePath)}
                  >
                    <View
                      style={[
                        styles.fileIcon,
                        { backgroundColor: `#10B98115` },
                      ]}
                    >
                      <Feather name="file" size={24} color="#10B981" />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: '#F1F5F9' }]}>
                        Sao lưu
                      </Text>
                      <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                        {formatFileName(filePath)}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#64748B" />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Pressable
            style={[
              styles.cancelButton,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelText, { color: '#94A3B8' }]}>Huỷ</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  fileListContainer: {
    flex: 1,
    minHeight: 200,
  },
  fileList: {
    paddingHorizontal: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    margin: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
