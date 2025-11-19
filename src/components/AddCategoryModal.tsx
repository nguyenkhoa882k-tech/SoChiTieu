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
  'coffee', 'shopping-bag', 'home', 'car', 'heart', 'book', 'music',
  'camera', 'gift', 'star', 'umbrella', 'briefcase', 'phone', 'mail',
  'globe', 'tool', 'scissors', 'droplet', 'sun', 'moon', 'cloud',
  'zap', 'film', 'headphones', 'watch', 'award', 'target', 'flag',
  'pie-chart', 'battery', 'wifi', 'bluetooth', 'monitor', 'printer',
  'cpu', 'hard-drive', 'package', 'truck', 'anchor', 'key',
];

const AVAILABLE_COLORS = [
  '#E74C3C', '#E91E63', '#9B59B6', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B',
  '#1ABC9C', '#2ECC71', '#3498DB', '#F39C12', '#E67E22', '#C0392B',
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

export function AddCategoryModal({ visible, onClose, onAdd }: AddCategoryModalProps) {
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
          style={[styles.modalContainer, { backgroundColor: palette.card }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>
              Thêm danh mục mới
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={palette.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tên danh mục */}
            <Text style={[styles.label, { color: palette.muted }]}>Tên danh mục *</Text>
            <TextInput
              style={[styles.input, { borderColor: palette.border, color: palette.text, backgroundColor: palette.background }]}
              placeholder="Ví dụ: Ăn sáng, Xăng xe..."
              placeholderTextColor={palette.muted}
              value={label}
              onChangeText={setLabel}
            />

            {/* Loại */}
            <Text style={[styles.label, { color: palette.muted }]}>Loại giao dịch</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && { backgroundColor: palette.primary, borderColor: palette.primary },
                  type !== 'expense' && { backgroundColor: palette.card, borderColor: palette.border },
                ]}
                onPress={() => setType('expense')}
              >
                <Feather
                  name="arrow-up-right"
                  size={18}
                  color={type === 'expense' ? '#fff' : palette.text}
                />
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive, type !== 'expense' && { color: palette.text }]}>
                  Khoản chi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && { backgroundColor: palette.primary, borderColor: palette.primary },
                  type !== 'income' && { backgroundColor: palette.card, borderColor: palette.border },
                ]}
                onPress={() => setType('income')}
              >
                <Feather
                  name="arrow-down-left"
                  size={18}
                  color={type === 'income' ? '#fff' : palette.text}
                />
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive, type !== 'income' && { color: palette.text }]}>
                  Khoản thu
                </Text>
              </TouchableOpacity>
            </View>

            {/* Icon */}
            <Text style={[styles.label, { color: palette.muted }]}>Chọn biểu tượng</Text>
            <View style={styles.iconGrid}>
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && { backgroundColor: `${selectedColor}20`, borderColor: selectedColor },
                    selectedIcon !== icon && { backgroundColor: palette.background, borderColor: palette.border },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Feather
                    name={icon as any}
                    size={20}
                    color={selectedIcon === icon ? selectedColor : palette.muted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Màu sắc */}
            <Text style={[styles.label, { color: palette.muted }]}>Chọn màu sắc</Text>
            <View style={styles.colorGrid}>
              {AVAILABLE_COLORS.map((color) => (
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
            <Text style={[styles.label, { color: palette.muted }]}>Mô tả (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: palette.border, color: palette.text, backgroundColor: palette.background }]}
              placeholder="Thêm mô tả ngắn..."
              placeholderTextColor={palette.muted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Preview */}
            <Text style={[styles.label, { color: palette.muted }]}>Xem trước</Text>
            <View
              style={[
                styles.preview,
                { backgroundColor: `${selectedColor}15`, borderColor: selectedColor },
              ]}
            >
              <Feather name={selectedIcon as any} size={24} color={selectedColor} />
              <Text style={[styles.previewText, { color: palette.text }]}>
                {label || 'Tên danh mục'}
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: palette.background, borderColor: palette.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: palette.muted }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton, { backgroundColor: palette.primary }]}
              onPress={handleAdd}
              disabled={!label.trim()}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>Thêm</Text>
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
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 14,
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
    fontSize: 16,
    fontWeight: '700',
  },
  addButtonText: {
    color: '#fff',
  },
});
