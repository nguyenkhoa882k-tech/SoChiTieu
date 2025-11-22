import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { pie, arc } from 'd3-shape';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { AppHeader } from '@/components/AppHeader';

const chartWidth = Dimensions.get('window').width - 70;
const radius = chartWidth / 2.5;

type ViewMode = 'month' | 'year' | 'lifetime';

export function CategoryReportScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      if (viewMode === 'month') {
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }
      if (viewMode === 'year') {
        return date.getFullYear() === selectedYear;
      }
      return true; // lifetime
    });
  }, [transactions, viewMode, selectedMonth, selectedYear]);

  const expenseByCategory = useMemo(() => {
    const bucket: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeByCategory = useMemo(() => {
    const bucket: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'income')
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpense = expenseByCategory.reduce(
    (sum, cat) => sum + cat.value,
    0,
  );
  const totalIncome = incomeByCategory.reduce((sum, cat) => sum + cat.value, 0);

  const expensePieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(expenseByCategory);
  const incomePieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(incomeByCategory);
  const arcGenerator = arc<any>()
    .innerRadius(radius * 0.45)
    .outerRadius(radius);

  const monthNames = [
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

  const getPeriodLabel = () => {
    if (viewMode === 'month') {
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    }
    if (viewMode === 'year') {
      return `Năm ${selectedYear}`;
    }
    return 'Toàn bộ';
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <AppHeader title="Báo cáo danh mục" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.modeSelector}>
          {(['month', 'year', 'lifetime'] as ViewMode[]).map(mode => (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                {
                  backgroundColor:
                    viewMode === mode ? palette.primary : 'transparent',
                  borderColor: palette.border,
                },
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: viewMode === mode ? '#fff' : palette.text,
                  },
                ]}
              >
                {mode === 'month'
                  ? 'Tháng'
                  : mode === 'year'
                  ? 'Năm'
                  : 'Toàn bộ'}
              </Text>
            </Pressable>
          ))}
        </View>

        {(viewMode === 'month' || viewMode === 'year') && (
          <Pressable
            style={[
              styles.periodSelector,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            onPress={() => {
              if (viewMode === 'month') {
                setShowMonthPicker(true);
              }
            }}
          >
            <Text style={[styles.periodText, { color: palette.text }]}>
              {getPeriodLabel()}
            </Text>
            <Feather name="calendar" size={20} color={palette.primary} />
          </Pressable>
        )}

        {expenseByCategory.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Chi tiêu theo danh mục
            </Text>
            <Text style={[styles.totalText, { color: palette.danger }]}>
              Tổng: {formatCurrency(totalExpense)}
            </Text>
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={radius * 2}>
                <G x={chartWidth / 2} y={radius}>
                  {expensePieSlices.map((slice, index) => (
                    <Path
                      key={index}
                      d={arcGenerator(slice) || ''}
                      fill={expenseByCategory[index].color}
                    />
                  ))}
                </G>
              </Svg>
            </View>

            <View style={styles.categoryList}>
              {expenseByCategory.map(cat => {
                const percent = ((cat.value / totalExpense) * 100).toFixed(1);
                return (
                  <View key={cat.categoryId} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[styles.dot, { backgroundColor: cat.color }]}
                      />
                      <Text
                        style={[styles.categoryLabel, { color: palette.text }]}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text
                        style={[styles.categoryAmount, { color: palette.text }]}
                      >
                        {formatCurrency(cat.value)}
                      </Text>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        {percent}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {incomeByCategory.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Thu nhập theo danh mục
            </Text>
            <Text style={[styles.totalText, { color: palette.success }]}>
              Tổng: {formatCurrency(totalIncome)}
            </Text>
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={radius * 2}>
                <G x={chartWidth / 2} y={radius}>
                  {incomePieSlices.map((slice, index) => (
                    <Path
                      key={index}
                      d={arcGenerator(slice) || ''}
                      fill={incomeByCategory[index].color}
                    />
                  ))}
                </G>
              </Svg>
            </View>

            <View style={styles.categoryList}>
              {incomeByCategory.map(cat => {
                const percent = ((cat.value / totalIncome) * 100).toFixed(1);
                return (
                  <View key={cat.categoryId} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[styles.dot, { backgroundColor: cat.color }]}
                      />
                      <Text
                        style={[styles.categoryLabel, { color: palette.text }]}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text
                        style={[styles.categoryAmount, { color: palette.text }]}
                      >
                        {formatCurrency(cat.value)}
                      </Text>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        {percent}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <MonthYearPicker
        visible={showMonthPicker}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClose={() => setShowMonthPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 15,
  },
  categoryValues: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
