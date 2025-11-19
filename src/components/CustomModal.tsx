import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';

const { width } = Dimensions.get('window');

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function CustomModal({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  showCancel = false,
}: CustomModalProps) {
  const palette = useThemeStore(state => state.palette);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#10b981' };
      case 'error':
        return { name: 'x-circle', color: '#ef4444' };
      case 'warning':
        return { name: 'alert-triangle', color: '#f59e0b' };
      default:
        return { name: 'info', color: palette.primary };
    }
  };

  const iconConfig = getIconConfig();

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleCancel}
          style={styles.overlayTouchable}
        />
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(80)}
          exiting={SlideOutDown.duration(150)}
          style={[styles.modalContainer, { backgroundColor: palette.card }]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
            <Feather name={iconConfig.name} size={40} color={iconConfig.color} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: palette.muted }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCancel}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: palette.background, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.buttonText, { color: palette.muted }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleConfirm}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: iconConfig.color },
                showCancel && styles.buttonWithMargin,
              ]}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width - 64,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonWithMargin: {
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
  },
});
