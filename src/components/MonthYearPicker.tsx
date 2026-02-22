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
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
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
          style={[styles.modalContainer, { backgroundColor: '#1a1f2e' }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#F1F5F9' }]}>
              Chọn tháng và năm
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Year Selector */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>Năm</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.yearScroll}
              contentContainerStyle={styles.yearScrollContent}
            >
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    tempYear === year && {
                      backgroundColor: '#10B981',
                      borderColor: '#10B981',
                    },
                    tempYear !== year && {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                  onPress={() => setTempYear(year)}
                >
                  <Text
                    style={[
                      styles.yearText,
                      tempYear === year && styles.yearTextActive,
                      tempYear !== year && { color: '#94A3B8' },
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Month Selector */}
            <Text style={[styles.label, { color: '#94A3B8' }]}>Tháng</Text>
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthChip,
                    tempMonth === index && {
                      backgroundColor: '#10B981',
                      borderColor: '#10B981',
                    },
                    tempMonth !== index && {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                  onPress={() => setTempMonth(index)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      tempMonth === index && styles.monthTextActive,
                      tempMonth !== index && { color: '#94A3B8' },
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
                styles.confirmButton,
                { backgroundColor: '#10B981' },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                Xác nhận
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
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  yearScroll: {
    marginBottom: 6,
  },
  yearScrollContent: {
    gap: 6,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  yearTextActive: {
    color: '#fff',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthChip: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthTextActive: {
    color: '#fff',
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
    borderWidth: 1,
  },
  confirmButton: {
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
  confirmButtonText: {
    color: '#fff',
  },
});
