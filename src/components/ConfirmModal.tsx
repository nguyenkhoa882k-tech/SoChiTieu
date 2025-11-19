import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmModalProps) {
  const palette = useThemeStore(state => state.palette);

  const getIconConfig = () => {
    switch (type) {
      case 'danger':
        return { name: 'alert-triangle', color: palette.danger };
      case 'info':
        return { name: 'info', color: palette.primary };
      default:
        return { name: 'alert-circle', color: '#f59e0b' };
    }
  };

  const iconConfig = getIconConfig();

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
              { backgroundColor: `${iconConfig.color}15` },
            ]}
          >
            <Feather
              name={iconConfig.name as any}
              size={32}
              color={iconConfig.color}
            />
          </View>

          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.muted }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: palette.background, borderColor: palette.border },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: palette.text }]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: iconConfig.color },
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                {confirmText}
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
