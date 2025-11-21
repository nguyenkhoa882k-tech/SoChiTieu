import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';

interface ExportOptionsModalProps {
  visible: boolean;
  title: string;
  message: string;
  onShare: () => void;
  onDownload: () => void;
  onCancel: () => void;
}

export function ExportOptionsModal({
  visible,
  title,
  message,
  onShare,
  onDownload,
  onCancel,
}: ExportOptionsModalProps) {
  const palette = useThemeStore(state => state.palette);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View
        entering={FadeIn.duration(150)}
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Animated.View
          entering={SlideInDown.damping(20).stiffness(80)}
          style={[
            styles.content,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${palette.success}15` },
            ]}
          >
            <Feather name="check-circle" size={32} color={palette.success} />
          </View>

          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.muted }]}>
            {message}
          </Text>

          <View style={styles.buttonColumn}>
            <Pressable
              style={[styles.button, { backgroundColor: palette.primary }]}
              onPress={onShare}
            >
              <Feather name="share-2" size={18} color="#fff" />
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                Chia sẻ
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: palette.success }]}
              onPress={onDownload}
            >
              <Feather name="download" size={18} color="#fff" />
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                Chỉ tải về
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: palette.text }]}>
                Đóng
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonColumn: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
