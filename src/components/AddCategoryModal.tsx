import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';
import { TransactionType } from '@/types/transaction';

const AVAILABLE_ICONS = [
  'coffee',
  'shopping-bag',
  'home',
  'car',
  'heart',
  'book',
  'music',
  'camera',
  'gift',
  'star',
  'umbrella',
  'briefcase',
  'phone',
  'mail',
  'globe',
  'tool',
  'scissors',
  'droplet',
  'sun',
  'moon',
  'cloud',
  'zap',
  'film',
  'headphones',
  'watch',
  'award',
  'target',
  'flag',
  'pie-chart',
  'battery',
  'wifi',
  'bluetooth',
  'monitor',
  'printer',
  'cpu',
  'hard-drive',
  'package',
  'truck',
  'anchor',
  'key',
];

const AVAILABLE_COLORS = [
  '#E74C3C',
  '#E91E63',
  '#9B59B6',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#1ABC9C',
  '#2ECC71',
  '#3498DB',
  '#F39C12',
  '#E67E22',
  '#C0392B',
];

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (category: {
    label: string;
    type: TransactionType;
    icon: string;
    color: string;
    description?: string;
  }) => void;
}

export function AddCategoryModal({
  visible,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const palette = useThemeStore(state => state.palette);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState('#3498DB');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!label.trim()) return;

    onAdd({
      label: label.trim(),
      type,
      icon: selectedIcon,
      color: selectedColor,
      description: description.trim() || undefined,
    });

    // Reset form
    setLabel('');
    setType('expense');
    setSelectedIcon('star');
    setSelectedColor('#3498DB');
    setDescription('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.overlayTouchable}
        />
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(80)}
          exiting={SlideOutDown.duration(150)}
          style={[styles.modalContainer, { backgroundColor: '#1a1f2e' }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#F1F5F9' }]}>
              Thêm danh mục mới
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Tên danh mục */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>
              Tên danh mục *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#F1F5F9',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              ]}
              placeholder="Ví dụ: Ăn sáng, Xăng xe..."
              placeholderTextColor="#64748B"
              value={label}
              onChangeText={setLabel}
            />

            {/* Loại */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>
              Loại giao dịch
            </Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && {
                    backgroundColor: '#EC4899',
                    borderColor: '#EC4899',
                  },
                  type !== 'expense' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                ]}
                onPress={() => setType('expense')}
              >
                <Feather
                  name="arrow-up-right"
                  size={14}
                  color={type === 'expense' ? '#fff' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === 'expense' && styles.typeTextActive,
                    type !== 'expense' && { color: '#94A3B8' },
                  ]}
                >
                  Khoản chi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && {
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                  },
                  type !== 'income' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                ]}
                onPress={() => setType('income')}
              >
                <Feather
                  name="arrow-down-left"
                  size={14}
                  color={type === 'income' ? '#fff' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === 'income' && styles.typeTextActive,
                    type !== 'income' && { color: '#94A3B8' },
                  ]}
                >
                  Khoản thu
                </Text>
              </TouchableOpacity>
            </View>

            {/* Icon */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>
              Chọn biểu tượng
            </Text>
            <View style={styles.iconGrid}>
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && {
                      backgroundColor: `${selectedColor}20`,
                      borderColor: selectedColor,
                    },
                    selectedIcon !== icon && {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Feather
                    name={icon as any}
                    size={20}
                    color={selectedIcon === icon ? selectedColor : '#64748B'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Màu sắc */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>
              Chọn màu sắc
            </Text>
            <View style={styles.colorGrid}>
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Feather name="check" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Mô tả */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>
              Mô tả (tùy chọn)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#F1F5F9',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              ]}
              placeholder="Thêm mô tả ngắn..."
              placeholderTextColor="#64748B"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Preview */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>Xem trước</Text>
            <View
              style={[
                styles.preview,
                {
                  backgroundColor: `${selectedColor}15`,
                  borderColor: selectedColor,
                },
              ]}
            >
              <Feather
                name={selectedIcon as any}
                size={20}
                color={selectedColor}
              />
              <Text style={[styles.previewText, { color: '#F1F5F9' }]}>
                {label || 'Tên danh mục'}
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: '#94A3B8' }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleAdd}
              disabled={!label.trim()}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>
                Thêm
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingTop: 10,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  addButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addButtonText: {
    color: '#fff',
  },
});
