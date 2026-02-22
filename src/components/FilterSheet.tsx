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
import { useThemeStore } from '@/stores/themeStore';

interface FilterSheetProps {
  visible: boolean;
  value: TransactionFilter;
  onClose: () => void;
  onApply: (filter: TransactionFilter) => void;
}

export function FilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: FilterSheetProps) {
  const [localFilter, setLocalFilter] = useState<TransactionFilter>(value);
  const palette = useThemeStore(state => state.palette);
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
      marks[startDate] = {
        selected: true,
        startingDay: true,
        endingDay: true,
        color: palette.primary,
        textColor: '#fff',
      };
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
              backgroundColor: '#1a1f2e',
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
            <Text style={[styles.title, { color: '#F1F5F9' }]}>Bộ lọc</Text>
            <Pressable onPress={resetFilter}>
              <Text style={[styles.resetText, { color: '#10B981' }]}>
                Đặt lại
              </Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: '#94A3B8' }]}>
              Loại
            </Text>
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
                        backgroundColor: active ? '#10B981' : 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    ]}
                    onPress={() =>
                      setLocalFilter(prev => ({
                        ...prev,
                        type: item.key as TransactionFilter['type'],
                      }))
                    }
                  >
                    <Feather
                      name={item.icon as any}
                      color={active ? '#fff' : '#94A3B8'}
                      size={14}
                    />
                    <Text
                      style={{
                        color: active ? '#fff' : '#94A3B8',
                        marginLeft: 4,
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: '#94A3B8' }]}>
              Danh mục
            </Text>
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
                        borderColor: selected
                          ? '#10B981'
                          : 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: selected ? `#10B98122` : 'transparent',
                      },
                    ]}
                  >
                    <Feather
                      name={category.icon as any}
                      color={selected ? '#10B981' : '#64748B'}
                      size={14}
                    />
                    <Text
                      style={{
                        color: selected ? '#10B981' : '#94A3B8',
                        marginLeft: 6,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: '#94A3B8' }]}>
              Thời gian
            </Text>
            <Calendar
              markingType="period"
              markedDates={markedDates}
              onDayPress={day => handleSelectDay(day.dateString)}
              theme={{
                calendarBackground: '#1a1f2e',
                dayTextColor: '#F1F5F9',
                monthTextColor: '#F1F5F9',
                todayTextColor: '#10B981',
                textDayFontSize: 13,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 11,
              }}
              style={{ borderRadius: 12 }}
            />
          </ScrollView>
          <Pressable
            style={[styles.applyButton, { backgroundColor: '#10B981' }]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  applyButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
