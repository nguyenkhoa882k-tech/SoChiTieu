import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Calendar } from 'react-native-calendars';
import { CATEGORY_LIST } from '@/constants/categories';
import { TransactionFilter, defaultFilter } from '@/types/filters';
import { useThemePalette } from '@/theme/ThemeProvider';

interface FilterSheetProps {
  visible: boolean;
  value: TransactionFilter;
  onClose: () => void;
  onApply: (filter: TransactionFilter) => void;
}

export function FilterSheet({ visible, value, onClose, onApply }: FilterSheetProps) {
  const [localFilter, setLocalFilter] = useState<TransactionFilter>(value);
  const { palette } = useThemePalette();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLocalFilter({ ...value, categories: [...value.categories] });
  }, [value]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, visible]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const { startDate, endDate } = localFilter;
    if (startDate && !endDate) {
      marks[startDate] = { selected: true, startingDay: true, endingDay: true, color: palette.primary, textColor: '#fff' };
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      while (current <= end) {
        const iso = current.toISOString().slice(0, 10);
        marks[iso] = {
          color: palette.primary,
          textColor: '#fff',
          startingDay: iso === startDate,
          endingDay: iso === endDate,
        };
        current.setDate(current.getDate() + 1);
      }
    }
    return marks;
  }, [localFilter, palette.primary]);

  const handleSelectDay = (dateString: string) => {
    setLocalFilter(prev => {
      if (!prev.startDate || (prev.startDate && prev.endDate)) {
        return { ...prev, startDate: dateString, endDate: undefined };
      }
      if (dateString < prev.startDate) {
        return { ...prev, startDate: dateString, endDate: prev.startDate };
      }
      return { ...prev, endDate: dateString };
    });
  };

  const toggleCategory = (categoryId: string) => {
    setLocalFilter(prev => {
      const exists = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(item => item !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  };

  const applyFilter = () => {
    onApply({ ...localFilter, categories: [...localFilter.categories] });
    onClose();
  };

  const resetFilter = () => {
    setLocalFilter({ ...defaultFilter });
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.card,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: palette.text }]}>Bộ lọc</Text>
              <Pressable onPress={resetFilter}>
                <Text style={[styles.resetText, { color: palette.primary }]}>Đặt lại</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionLabel, { color: palette.muted }]}>Loại giao dịch</Text>
              <View style={styles.typeRow}>
                {[
                  { key: 'all', label: 'Tất cả', icon: 'layers' },
                  { key: 'income', label: 'Thu', icon: 'trending-up' },
                  { key: 'expense', label: 'Chi', icon: 'trending-down' },
                ].map(item => {
                  const active = localFilter.type === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: active ? palette.primary : 'transparent',
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setLocalFilter(prev => ({ ...prev, type: item.key as TransactionFilter['type'] }))}
                    >
                      <Feather
                        name={item.icon as any}
                        color={active ? '#fff' : palette.text}
                        size={16}
                      />
                      <Text
                        style={{
                          color: active ? '#fff' : palette.text,
                          marginLeft: 6,
                          fontWeight: '600',
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, { color: palette.muted }]}>Danh mục</Text>
              <View style={styles.categoryGrid}>
                {CATEGORY_LIST.map(category => {
                  const selected = localFilter.categories.includes(category.id);
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => toggleCategory(category.id)}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: selected ? palette.primary : palette.border,
                          backgroundColor: selected ? `${palette.primary}22` : 'transparent',
                        },
                      ]}
                    >
                      <Feather
                        name={category.icon as any}
                        color={selected ? palette.primary : palette.muted}
                        size={18}
                      />
                      <Text style={{ color: palette.text, marginLeft: 8 }}>{category.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, { color: palette.muted }]}>Khoảng thời gian</Text>
              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={day => handleSelectDay(day.dateString)}
                theme={{
                  calendarBackground: palette.card,
                  dayTextColor: palette.text,
                  monthTextColor: palette.text,
                  todayTextColor: palette.secondary,
                }}
              />
            </ScrollView>
            <Pressable
              style={[styles.applyButton, { backgroundColor: palette.primary }]}
              onPress={applyFilter}
            >
              <Text style={styles.applyText}>Áp dụng</Text>
            </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 14,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  applyButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
