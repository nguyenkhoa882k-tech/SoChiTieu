import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
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

interface MonthYearPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
}

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export function MonthYearPicker({
  visible,
  onClose,
  selectedMonth,
  selectedYear,
  onSelect,
}: MonthYearPickerProps) {
  const palette = useThemeStore(state => state.palette);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleConfirm = () => {
    onSelect(tempMonth, tempYear);
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
              Chọn tháng và năm
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={palette.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Year Selector */}
            <Text style={[styles.label, { color: palette.muted }]}>Năm</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.yearScroll}
              contentContainerStyle={styles.yearScrollContent}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    tempYear === year && { backgroundColor: palette.primary, borderColor: palette.primary },
                    tempYear !== year && { backgroundColor: palette.background, borderColor: palette.border },
                  ]}
                  onPress={() => setTempYear(year)}
                >
                  <Text
                    style={[
                      styles.yearText,
                      tempYear === year && styles.yearTextActive,
                      tempYear !== year && { color: palette.text },
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Month Selector */}
            <Text style={[styles.label, { color: palette.muted }]}>Tháng</Text>
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthChip,
                    tempMonth === index && { backgroundColor: palette.primary, borderColor: palette.primary },
                    tempMonth !== index && { backgroundColor: palette.background, borderColor: palette.border },
                  ]}
                  onPress={() => setTempMonth(index)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      tempMonth === index && styles.monthTextActive,
                      tempMonth !== index && { color: palette.text },
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: palette.background, borderColor: palette.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: palette.muted }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: palette.primary }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Xác nhận</Text>
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
    marginBottom: 12,
  },
  yearScroll: {
    marginBottom: 8,
  },
  yearScrollContent: {
    gap: 10,
  },
  yearChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  yearTextActive: {
    color: '#fff',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthChip: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthTextActive: {
    color: '#fff',
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
  confirmButton: {
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
  confirmButtonText: {
    color: '#fff',
  },
});
